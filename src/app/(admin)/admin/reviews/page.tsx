export const dynamic = "force-dynamic";

import connectDB from "@/shared/lib/mongodb";
import Product from "@/backend/models/Product";
import { Star, Trash2 } from "lucide-react";

export default async function ReviewsPage() {
  await connectDB();

  // Aggregate all reviews across all products
  const products = await Product.find({ "reviews.0": { $exists: true } }).select("name reviews");
  
  const allReviews: any[] = [];
  products.forEach((product: any) => {
    product.reviews.forEach((review: any) => {
      allReviews.push({
        productId: product._id.toString(),
        productName: product.name,
        reviewId: review._id?.toString() || Math.random().toString(),
        userName: review.name,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt || new Date(),
      });
    });
  });

  // Sort by date newest first
  allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-foreground">Customer Reviews</h1>
        <p className="text-muted-foreground mt-1">Monitor and manage product feedback from verified buyers.</p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/20 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Rating</th>
                <th className="px-6 py-4 font-semibold">Comment</th>
                <th className="px-6 py-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {allReviews.map((review) => (
                <tr key={review.reviewId} className="hover:bg-secondary/15 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{review.productName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{review.userName}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star 
                          key={idx} 
                          className={`w-4 h-4 ${idx < review.rating ? 'text-amber-500 fill-amber-500' : 'text-border/60'}`} 
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground max-w-xs truncate" title={review.comment}>
                    {review.comment}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {allReviews.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No product reviews submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
