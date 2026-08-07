const SMS_API_URL = "https://smsapiph.onrender.com/api/v1/send/sms";

export async function sendSms(phone: string, message: string) {
  const apiKey = process.env.SMS_API_KEY;
  if (!apiKey) {
    console.log(`[SMS] SMS_API_KEY not set — would send to ${phone}: "${message}"`);
    return { ok: true, simulated: true };
  }

  const res = await fetch(SMS_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient: phone,
      message,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`SMS send failed (${res.status}): ${text}`);
  }

  return { ok: true, simulated: false };
}