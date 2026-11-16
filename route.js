import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'اكتب رسالة أولاً.' }, { status: 400 });
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'لم يتم إعداد مفتاح الذكاء الاصطناعي بعد. أضف OPENAI_API_KEY إلى ملف .env.local ثم أعد تشغيل المشروع.' }, { status: 503 });
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        instructions: 'أنت BALOH AI، مساعد متعدد اللغات. أجب بوضوح وبالعربية ما لم يطلب المستخدم لغة أخرى. لا تدّع تنفيذ إجراءات خارجية لم تنفذها فعلاً.',
        input: message
      })
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data.error?.message || 'حدث خطأ من خدمة الذكاء الاصطناعي.' }, { status: response.status });
    const reply = data.output?.flatMap(item => item.content || []).filter(item => item.type === 'output_text').map(item => item.text).join('\n') || 'لم يصل رد نصي.';
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: 'حدث خطأ أثناء معالجة الطلب.' }, { status: 500 });
  }
}
