import { NextResponse } from 'next/server';
import dbConnect from '@/shared/lib/mongodb';
import Review from '@/backend/models/Review';
import Product from '@/backend/models/Product';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await dbConnect();

    const reviews = await Review.find({ product: productId, isApproved: true })
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = reviews.length;
    let averageRating = 0;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, r) => {
        const star = Math.min(5, Math.max(1, Math.round(r.rating)));
        ratingCounts[star as keyof typeof ratingCounts] = (ratingCounts[star as keyof typeof ratingCounts] || 0) + 1;
        return acc + r.rating;
      }, 0);
      averageRating = Number((sum / totalReviews).toFixed(1));
    }

    return NextResponse.json({
      reviews,
      totalReviews,
      averageRating,
      ratingCounts,
    });
  } catch (error: any) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { productId, rating, comment, title, userName } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Please provide a star rating between 1 and 5' }, { status: 400 });
    }

    if (!comment || comment.trim().length < 5) {
      return NextResponse.json({ error: 'Please write a review comment with at least 5 characters' }, { status: 400 });
    }

    await dbConnect();

    const reviewerName = userName?.trim() || session?.user?.name || 'Verified Buyer';

    const review = await Review.create({
      product: productId,
      user: session?.user?.id || undefined,
      userName: reviewerName,
      title: title?.trim() || '',
      rating: Number(rating),
      comment: comment.trim(),
      isApproved: true,
    });

    // Recalculate product average rating & review count in MongoDB
    const allReviews = await Review.find({ product: productId, isApproved: true });
    const count = allReviews.length;
    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = count > 0 ? Number((sum / count).toFixed(1)) : 0;

    await Product.findByIdAndUpdate(productId, {
      averageRating: avg,
      reviewCount: count,
    });

    return NextResponse.json({
      success: true,
      review: {
        _id: review._id.toString(),
        userName: reviewerName,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        createdAt: review.createdAt,
      },
      averageRating: avg,
      reviewCount: count,
    });
  } catch (error: any) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
