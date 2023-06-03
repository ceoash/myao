import { mailOptions, transporter } from "@/utils/nodemailer";

const generateEmailContent = (data:any) => {
  const stringData = Object.entries(data).reduce(
    (str, [key, val]) =>
      (str += `${[key]}: \n${val} \n \n`),
    ""
  );

  const email = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns:fb="https://www.facebook.com/2008/fbml" xmlns:og="http://opengraph.org/schema/"><head><meta property="og:title" content="Clara Wellness Inc."><meta property="fb:page_id" content="43929265776"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MYAO</title><style type="text/css">p{margin:10px 0;padding:0}table{border-collapse:collapse}h1,h2,h3,h4,h5,h6{display:block;margin:0;padding:0}a img,img{border:0;height:auto;outline:0;text-decoration:none}#bodyCell,#bodyTable,body{height:100%;margin:0;padding:0;width:100%}#outlook a{padding:0}@-ms-viewport{width:device-width}img{-ms-interpolation-mode:bicubic}table{mso-table-lspace:0;mso-table-rspace:0}.ReadMsgBody{width:100%}.ExternalClass{width:100%}a,blockquote,li,p,td{mso-line-height-rule:exactly}a[href^=sms],a[href^=tel]{color:inherit;cursor:default;text-decoration:none}a,blockquote,body,h1,h2,h3,h4,li,p,table,td{-webkit-font-smoothing:antialiased}a,blockquote,body,li,p,table,td{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}.ExternalClass,.ExternalClass div,.ExternalClass font,.ExternalClass p,.ExternalClass span,.ExternalClass td{line-height:100%}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important}@media only screen and (max-width:480px){h1{font-size:26px!important;line-height:36px!important}#bodyContent p{font-size:16px!important;line-height:28px!important}#buttonContent a{font-size:14px!important}.columnContainer{display:block!important;max-width:100%!important;width:100%!important}#footerContent p{font-size:12px!important;line-height:19px!important;display:inline!important}.footerImage{height:auto!important;max-width:480px;width:120px!important}}</style></head><body style="background-color:#f4f4f4;margin:0;min-width:100%"><div><center><table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable" style="background-color:#f4f4f4"><tr><td align="center" height="100%" valign="bottom" width="100%" id="bodyCell" style="background-color:#5ba4e5"><span style="color:#18130f;display:none;font-size:0;height:0;line-height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;visibility:hidden;width:0">This is some hidden text bullshit.</span><!--[if gte mso 9]><table align="center" border="0" cellspacing="0" cellpadding="0" width="640"><tr><td align="center" valign="top" width="640"><![endif]--><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#5ba4e5;max-width:640px"><tr><td align="center" valign="bottom" style="font-size:0"><img src="http://edigil.com/clara/top.jpg" alt="" style="border:0;display:block;height:auto;max-width:600px;vertical-align:bottom;width:100%"></td></tr></table><!--[if gte mso 9]><![endif]--></td></tr><tr><td align="center" height="100%" valign="top" width="100%" style="background-color:#f4f4f4"><!--[if gte mso 9]><table align="center" border="0" cellspacing="0" cellpadding="0" width="640"><tr><td align="center" valign="top" width="640"><![endif]--><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f4f4;max-width:640px"><tr><td align="center" valign="top" style="font-size:0"><img src="http://edigil.com/clara/bottom.jpg" alt="" style="border:0;display:block;height:auto;max-width:600px;vertical-align:top;width:100%"></td></tr></table><!--[if gte mso 9]><![endif]--></td></tr><tr><td align="center" valign="top" style="background-color:#f4f4f4;padding-top:20px;padding-bottom:20px"><!--[if gte mso 9]><table align="center" border="0" cellspacing="0" cellpadding="0" width="510"><tr><td align="center" valign="top"><![endif]--><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:510px"><tr><td align="left" valign="top" id="bodyContent" style="padding-right:20px;padding-bottom:14px;padding-left:20px"><h1 style="color:#535554;font-family:Open Sans,sans-serif;font-size:28px;font-weight:400;line-height:40px;letter-spacing:.7px;margin:0;padding-bottom:8px;text-align:left">Hello, ${data.email}</h1><p style="color:#535554;font-family:Open Sans,sans-serif;font-size:14px;font-weight:400;line-height:24px;text-align:left">You have been invited by<b>Colorado Gym Chain</b>to discuss an offer for your<b>...item.</b></p></td></tr><tr><td align="left" valign="top" id="buttonContent" style="padding-right:20px;padding-left:20px"><a href="#" target="_blank" style="background-color:#c75611;border-top:11px solid #c75611;border-right:18px solid #c75611;border-bottom:11px #c75611;border-left:18px solid #c75611;border-radius:4px;color:#fff;display:inline-block;font-family:Open Sans,sans-serif;font-size:13px;font-weight:600;letter-spacing:.7px;margin:5px auto 10px;text-align:center;text-decoration:none">Get Started</a></td></tr></table><!--[if gte mso 9]><![endif]--></td></tr><tr><td align="center" valign="top" style="background-color:#f4f4f4;padding-top:60px;padding-bottom:40px"><!--[if gte mso 9]><table align="center" border="0" cellspacing="0" cellpadding="0" width="510"><![endif]--><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:510px"><tr><td align="left" valign="top" style="padding-right:20px;padding-left:20px"><!--[if gte mso 9]><td align="left" valign="top" width="130"><![endif]--><table align="left" border="0" cellpadding="0" cellspacing="0" width="140" class="columnContainer"><tr><td align="left" valign="middle" class="columnContent" style="padding-top:4px;padding-bottom:20px">MYAO</td></tr></table><!--[if gte mso 9]><td align="left" valign="top" width="330"><![endif]--><table align="left" border="0" cellpadding="0" cellspacing="0" class="columnContainer"><tr><td align="left" valign="top" id="footerContent"><p style="color:#b7b7b7;font-family:'Open Sans',sans-serif;font-size:11px;font-weight:400;line-height:18px;margin:0;padding:0;text-align:left">&copy; 2023 MYAO.<a href="#" style="color:#b7b7b7;text-decoration:underline">Unsubscribe</a>, or<a href="#" style="color:#b7b7b7;text-decoration:underline">view in browser</a>.</p></td></tr></table></td></tr></table><!--[if gte mso 9></td></tr></table><![endif]--></td></tr></table></center></div></body></html>`

  return {
    text: stringData,
    html: email,
  };
};

const handler = async (req:any, res:any) => {
  if (req.method === "POST") {
    const data = req.body;
    
    try {
      await transporter.sendMail({
        ...mailOptions,
        ...generateEmailContent(data),
        subject: 'New MYAO Inviation:',
        to: data.email,
        
      });
      return res.status(200).json({success: true})
    }
    catch (err){
      console.log(err)
      return res.status(400).json({message: 'Bad request'})
    }
  }
  return res.status(400).json({message: 'Bad request'})
};

export default handler