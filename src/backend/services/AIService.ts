import { GoogleGenerativeAI } from '@google/generative-ai';
import { SettingService } from './SettingService';
import Product from '../models/Product';
import connectDB from '@/shared/lib/mongodb';

export class AIService {
  private settingService: SettingService;
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    this.settingService = new SettingService();
  }

  private async initGenAI() {
    if (this.genAI) return this.genAI;

    // Load API Key from Settings database
    let apiKey = await this.settingService.getSettingByKey('geminiApiKey');
    if (!apiKey) {
      apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    }

    if (!apiKey) {
      console.warn('Google Gemini API Key is missing. AI features will be disabled.');
      return null;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    return this.genAI;
  }

  /**
   * Generates a 768-dimension vector embedding for the input text using 'text-embedding-004'
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    const ai = await this.initGenAI();
    if (!ai) return null;

    try {
      const modelInstance = ai.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await modelInstance.embedContent(text);
      if (result && result.embedding && result.embedding.values) {
        return result.embedding.values;
      }
      return null;
    } catch (error) {
      console.error('Failed to generate vector embedding:', error);
      return null;
    }
  }

  /**
   * Computes cosine similarity between two vectors
   */
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Fetches AI Recommendations for a product by calculating cosine similarity in memory
   */
  async getRecommendations(productId: string, limit: number = 4) {
    await connectDB();

    const targetProduct = await Product.findById(productId);
    if (!targetProduct) return [];

    let targetEmbedding = targetProduct.embedding;
    if (!targetEmbedding || targetEmbedding.length === 0) {
      // Generate embedding dynamically if missing
      const textToEmbed = `${targetProduct.name}. ${targetProduct.description || ''}. Category: ${targetProduct.material || ''}`;
      const generated = await this.generateEmbedding(textToEmbed);
      if (generated) {
        targetProduct.embedding = generated;
        await targetProduct.save();
        targetEmbedding = generated;
      }
    }

    if (!targetEmbedding || targetEmbedding.length === 0) {
      // Fallback: return products from the same category
      return Product.find({
        _id: { $ne: productId },
        category: targetProduct.category,
        status: 'Published'
      }).limit(limit).exec();
    }

    // Fetch all published products with embeddings (excluding the target product)
    const candidates = await Product.find({
      _id: { $ne: productId },
      status: 'Published',
      embedding: { $exists: true, $not: { $size: 0 } }
    }).select('name slug description price discount finalPrice images category material weight color occasion embedding').exec();

    // Map candidates to their similarity score
    const scoredCandidates = candidates.map((cand) => {
      const similarity = this.cosineSimilarity(targetEmbedding!, cand.embedding || []);
      return { product: cand, similarity };
    });

    // Sort by similarity descending
    scoredCandidates.sort((a, b) => b.similarity - a.similarity);

    // Return the top N matching products without the embedding vector (to save bandwidth)
    return scoredCandidates.slice(0, limit).map((sc) => {
      const p = sc.product.toObject();
      delete p.embedding;
      return p;
    });
  }

  /**
   * Visual Search: analyzes an image using gemini-1.5-flash and returns a search query and key attributes
   */
  async analyzeImage(imageBuffer: Buffer, mimeType: string) {
    const ai = await this.initGenAI();
    if (!ai) return null;

    try {
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType
        },
      };

      const prompt = `
        Analyze this jewelry image. You are an expert gemologist and luxury jewelry curator.
        Please identify the details of this item. Extract:
        1. "itemType": The type of jewelry (e.g., ring, necklace, earrings, bracelet, pendant, bangle).
        2. "material": Primary metal or materials (e.g., gold, silver, diamond, ruby, emerald, sapphire, pearl).
        3. "style": Fashion style (e.g., traditional, modern, festive, minimalist, cocktail).
        4. "color": Dominant visual colors (e.g., gold, silver, rose gold, red, blue, green).
        5. "searchQuery": A concise, descriptive search string (e.g., "gold festive necklace with rubies") that we can use to query our product database.
        
        Provide the response in a valid JSON object format matching the keys above. Do not include any markdown wrappers or comments.
      `;

      const result = await model.generateContent([prompt, imagePart]);
      const text = result.response.text();
      
      // Parse clean JSON output (handling possible markdown backticks)
      const cleanJsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJsonStr);
    } catch (error) {
      console.error('Visual image analysis failed:', error);
      return null;
    }
  }
}
export default AIService;
