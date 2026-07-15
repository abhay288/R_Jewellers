import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/shared/lib/mongodb';
import { CategoryService } from '@/backend/services/CategoryService';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const service = new CategoryService();
    
    // Check if we want a tree or flat list
    const { searchParams } = new URL(request.url);
    const asTree = searchParams.get('tree');

    if (asTree === 'true') {
      const tree = await service.getCategoryTree();
      return NextResponse.json(tree);
    }

    const categories = await service.getCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Categories API GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    await connectDB();
    const service = new CategoryService();

    const category = await service.createCategory(data, session.user.id);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Categories API POST error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Duplicate entry detected (e.g. slug)' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, items } = await request.json();
    await connectDB();
    const service = new CategoryService();

    if (action === 'updateDisplayOrder' && Array.isArray(items)) {
      const result = await service.updateDisplayOrder(items, session.user.id);
      return NextResponse.json(result);
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Categories API PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
