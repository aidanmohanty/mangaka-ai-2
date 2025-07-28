const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@mangaka.ai';
  }

  async sendWelcomeEmail(user) {
    const msg = {
      to: user.email,
      from: this.fromEmail,
      subject: '🎌 Welcome to Mangaka.ai - Your AI Translation Journey Begins!',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 15px;">
          <div style="background: rgba(255, 255, 255, 0.95); padding: 40px; border-radius: 15px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #667eea; margin-bottom: 20px;">
              mangaka<span style="color: #f97316;">.ai</span>
            </div>
            
            <h1 style="color: #1f2937; margin-bottom: 30px;">Welcome, ${user.username}! 🎉</h1>
            
            <p style="color: #4b5563; font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
              Thank you for joining Mangaka.ai! You're now part of a community that's revolutionizing manga translation with AI.
            </p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin-bottom: 15px;">🚀 Get Started:</h3>
              <ul style="color: #4b5563; text-align: left; line-height: 1.8;">
                <li>Upload your first manga image</li>
                <li>Choose your target language</li>
                <li>Experience AI-powered translation</li>
                <li>Try optional AI coloring</li>
              </ul>
            </div>
            
            <div style="background: linear-gradient(45deg, #f97316, #ec4899); padding: 15px 30px; border-radius: 25px; display: inline-block; margin: 20px 0;">
              <a href="${process.env.CORS_ORIGIN}/dashboard" style="color: white; text-decoration: none; font-weight: 600; font-size: 16px;">
                Start Translating →
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Questions? Reply to this email or visit our <a href="${process.env.CORS_ORIGIN}/support" style="color: #667eea;">support center</a>.
            </p>
          </div>
        </div>
      `
    };

    try {
      await sgMail.send(msg);
      console.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error('Welcome email error:', error);
    }
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password?token=${resetToken}`;
    
    const msg = {
      to: user.email,
      from: this.fromEmail,
      subject: '🔐 Reset Your Mangaka.ai Password',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 15px;">
          <div style="background: rgba(255, 255, 255, 0.95); padding: 40px; border-radius: 15px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #667eea; margin-bottom: 20px;">
              mangaka<span style="color: #f97316;">.ai</span>
            </div>
            
            <h1 style="color: #1f2937; margin-bottom: 30px;">Password Reset Request</h1>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Hi ${user.username}, we received a request to reset your password.
            </p>
            
            <div style="background: linear-gradient(45deg, #f97316, #ec4899); padding: 15px 30px; border-radius: 25px; display: inline-block; margin: 20px 0;">
              <a href="${resetUrl}" style="color: white; text-decoration: none; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </p>
            
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px; word-break: break-all;">
              Or copy this link: ${resetUrl}
            </p>
          </div>
        </div>
      `
    };

    try {
      await sgMail.send(msg);
      console.log(`Password reset email sent to ${user.email}`);
    } catch (error) {
      console.error('Password reset email error:', error);
    }
  }

  async sendSubscriptionConfirmation(user, plan) {
    const planFeatures = {
      premium: ['100 manga pages/month', 'Advanced translation', 'AI colorization', 'HD quality', 'Priority support'],
      pro: ['Unlimited pages', 'Professional translation', '4K quality', 'Custom styles', 'API access', '24/7 support']
    };

    const msg = {
      to: user.email,
      from: this.fromEmail,
      subject: `🎉 Welcome to Mangaka.ai ${plan.charAt(0).toUpperCase() + plan.slice(1)}!`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 15px;">
          <div style="background: rgba(255, 255, 255, 0.95); padding: 40px; border-radius: 15px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #667eea; margin-bottom: 20px;">
              mangaka<span style="color: #f97316;">.ai</span>
            </div>
            
            <h1 style="color: #1f2937; margin-bottom: 30px;">Subscription Activated! 🚀</h1>
            
            <p style="color: #4b5563; font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
              Welcome to Mangaka.ai ${plan.charAt(0).toUpperCase() + plan.slice(1)}, ${user.username}!
            </p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin-bottom: 15px;">✨ Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} Features:</h3>
              <ul style="color: #4b5563; text-align: left; line-height: 1.8;">
                ${planFeatures[plan].map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
            
            <div style="background: linear-gradient(45deg, #f97316, #ec4899); padding: 15px 30px; border-radius: 25px; display: inline-block; margin: 20px 0;">
              <a href="${process.env.CORS_ORIGIN}/process" style="color: white; text-decoration: none; font-weight: 600; font-size: 16px;">
                Start Processing →
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Manage your subscription anytime in your <a href="${process.env.CORS_ORIGIN}/settings" style="color: #667eea;">account settings</a>.
            </p>
          </div>
        </div>
      `
    };

    try {
      await sgMail.send(msg);
      console.log(`Subscription confirmation sent to ${user.email}`);
    } catch (error) {
      console.error('Subscription email error:', error);
    }
  }

  async sendProcessingComplete(user, processedCount) {
    const msg = {
      to: user.email,
      from: this.fromEmail,
      subject: '✅ Your Manga Translation is Ready!',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 15px;">
          <div style="background: rgba(255, 255, 255, 0.95); padding: 40px; border-radius: 15px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #667eea; margin-bottom: 20px;">
              mangaka<span style="color: #f97316;">.ai</span>
            </div>
            
            <h1 style="color: #1f2937; margin-bottom: 30px;">Translation Complete! 🎌</h1>
            
            <p style="color: #4b5563; font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
              Hi ${user.username}, your manga translation is ready! We processed ${processedCount} text areas.
            </p>
            
            <div style="background: linear-gradient(45deg, #f97316, #ec4899); padding: 15px 30px; border-radius: 25px; display: inline-block; margin: 20px 0;">
              <a href="${process.env.CORS_ORIGIN}/history" style="color: white; text-decoration: none; font-weight: 600; font-size: 16px;">
                View Results →
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Keep translating! Your next manga adventure awaits.
            </p>
          </div>
        </div>
      `
    };

    try {
      await sgMail.send(msg);
      console.log(`Processing complete email sent to ${user.email}`);
    } catch (error) {
      console.error('Processing complete email error:', error);
    }
  }
}

module.exports = new EmailService();