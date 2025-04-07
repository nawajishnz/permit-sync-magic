import { sendContactFormEmail } from '@/utils/emailService';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const formData = req.body;
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Send email
    await sendContactFormEmail(formData);

    return res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error in contact API:', error);
    return res.status(500).json({ message: 'Failed to send message' });
  }
} 