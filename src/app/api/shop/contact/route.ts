import { NextResponse } from 'next/server';
import dbConnect from '@/shared/lib/mongodb';
import { ContactMessageService } from '@/backend/services/ContactMessageService';
import { z } from 'zod';

const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(5, 'Message must be at least 5 characters long'),
});

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Validate inputs
    const validatedData = contactFormSchema.parse(body);

    const contactService = new ContactMessageService();
    const message = await contactService.createMessage(validatedData);

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to submit contact message' },
      { status: 500 }
    );
  }
}
