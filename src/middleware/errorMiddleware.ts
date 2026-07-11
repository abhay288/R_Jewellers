import { NextResponse } from 'next/server';

export const errorHandler = (err: any) => {
  console.error(err);
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
};
