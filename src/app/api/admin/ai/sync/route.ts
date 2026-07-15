import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/shared/lib/mongodb';
import Product from '@/backend/models/Product';
import { AIService } from '@/backend/services/AIService';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const aiService = new AIService();
    
    // Find products lacking embeddings
    const products = await Product.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } }
      ]
    });

    let successCount = 0;
    let failCount = 0;

    for (const prod of products) {
      const textToEmbed = `${prod.name}. ${prod.description || ''}. Category: ${prod.material || ''}`;
      const embedding = await aiService.generateEmbedding(textToEmbed);
      if (embedding) {
        prod.embedding = embedding;
        await prod.save();
        successCount++;
      } else {
        failCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: products.length,
      successCount,
      failCount,
    });
  } catch (error: any) {
    console.error('AI Sync POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
