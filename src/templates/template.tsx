import { IEmailTemplate } from "@/interfaces/authenticated";
import { AppConfig } from "@/utils/AppConfig";

export const emailTemplate = (data: IEmailTemplate) => {
  const stringData = Object.entries(data).reduce(
    (str, [key, val]) => (str += `${[key]}: \n${val} \n \n`),
    ""
  );
  const email = `<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, 
  initial-scale=1.0;">
  <meta name="format-detection" content="telephone=no" />

  <style>
    /* Reset styles */
    body {
      margin: 0;
      padding: 0;
      min-width: 100%;
      width: 100% !important;
      height: 100% !important;
    }

    body,
    table,
    td,
    div,
    p,
    a {
      -webkit-font-smoothing: antialiased;
      text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
      line-height: 100%;
    }

    table,
    td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      border-collapse: collapse !important;
      border-spacing: 0;
    }

    img {
      border: 0;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }

    #outlook a {
      padding: 0;
    }

    .ReadMsgBody {
      width: 100%;
    }

    .ExternalClass {
      width: 100%;
    }

    .ExternalClass,
    .ExternalClass p,
    .ExternalClass span,
    .ExternalClass font,
    .ExternalClass td,
    .ExternalClass div {
      line-height: 100%;
    }

    @media all and (min-width: 560px) {
      body {
        margin-top: 30px;
      }
    }
    
    /* Rounded corners */
    @media all and (min-width: 560px) {
      .container {
        border-radius: 8px;
        -webkit-border-radius: 8px;
        -moz-border-radius: 8px;
        -khtml-border-radius: 8px;
      }
    }
    /* Links */
    a,
    a:hover {
      color: #127DB3;
    }

    .footer a,
    .footer a:hover {
      color: #999999;
    }
		
		button {
			text-decoration: none !important;
		}
  </style>

  <!-- MESSAGE SUBJECT -->
  <title>${data.listing?.title || "MYAO Notification"}</title>

</head>

<!-- BODY -->
<body topmargin="0" rightmargin="0" bottommargin="0" leftmargin="0" marginwidth="0" marginheight="0" width="100%" style="border-collapse: collapse; border-spacing: 0;  padding: 0; width: 100%; height: 100%; -webkit-font-smoothing: antialiased; text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 100%;
	background-color: #F0F0F0;
	color: #000000;" bgcolor="#F0F0F0" text="#000000">
  <table width="100%" align="center" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; width: 100%;" class="background">
    <tr>
      <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;" bgcolor="#F0F0F0">
        <table border="0" cellpadding="0" cellspacing="0" align="center" bgcolor="#FFFFFF" width="560" style="border-collapse: collapse; border-spacing: 0; padding: 0; width: 100%;
	max-width: 560px;" class="container">
          <tr>
            <td align="center" valign="middle" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 24px; font-weight: bold; veritcle-
		    line-height: 130%;
			padding-top: 25px;
			color: #4A4A4A;
			font-family: sans-serif;" class="header">
			<a href="${
        AppConfig.siteUrl
      }" style="font-family: sans-serif; color: #eaeaea; text-decoration: none; font-weight: bold" class="header">
              <img border="0" vspace="0" hspace="0" src="https://myao.vercel.app/images/cat.png" width="40" height="30" alt="MYAO" style="" title="MYAO" />
				<span style="font-size: 36px">MYAO</span>
            </a>
            </td>
          </tr>
          <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%;
			padding-top: 25px;" class="line">
              <hr color="#F6F6F6" align="center" width="100%" size="1" noshade style="margin: 0; padding: 0;" />
            </td>
          </tr>
          <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 17px; font-weight: 400; line-height: 160%;
			padding-top: 25px; 
			color: #000000;
			font-family: sans-serif;" class="paragraph">
              Hi ${data.name},
              <p style="font-size: 14px; font-weight: 400; line-height: 160%; margin: 0;">${
                data.body
              }</p>
              ${
                data.description
                  ? `<br /> <span style="font-size: 12px;color: #999999;">${data.description}</span>`
                  : ""
              }
            </td>
          </tr>
					<tr>
            <td align="left" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; padding-top: 25px; padding-bottom: 5px;" class="button">
							<div style="border: 1px solid #F0F0F0; background: #F6F6F6; border-radius: 6px;">
								<table style="font-family: sans-serif;">
									<tr style="padding: 4px">
										<td style="; padding: 6px 6px;">
											<img src="${
                        data?.image || "https://myao.vercel.app/images/cat.png"
                      }" height="40px" width="60px" style="border: 1px solid #F0F0F0; border-radius: 6px" />
										</td>
										<td style="width: 100%; padding: 0 6px">
											<p style="margin: 0; margin-bottom: 2px; padding: 0; font-family: sans-serif;" class="paragraph">${
                        data.listing?.title
                      }</p>
											<p style="margin: 0; padding: 0; font-family: sans-serif; font-size: 13px; color: gray;">${
                        data.listing?.category
                      }</p>
										</td>
										<td syle="padding: 6px">
                      <p style="margin: 0; padding: 2px 6px 0; font-size: 11px; color: gray; text-align: right; margin-bottom: 2px;">Price</p>
											<p style="margin: 0; padding: 0 6px;">${
                        data.listing?.price && data.listing?.price !== "0"
                          ? `£${data.listing?.price}`
                          : "Open offer"
                      }</p>
										</td>
										<tr>
									
									</table>
							</div>
						</td>
					</tr>
          <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; padding-top: 25px; padding-bottom: 5px;" class="button">
              <a href="/" style="text-decoration: none;" target="_blank" >
                <table border="0" cellpadding="0" cellspacing="0" align="center" style="max-width: 240px; min-width: 120px; border-collapse: collapse; border-spacing: 0; padding: 0;">
                  <tr>
                    <td align="center" valign="middle" style="padding: 12px 24px; margin: 0; border-collapse: collapse; border-spacing: 0; border-radius: 4px; -webkit-border-radius: 4px; -moz-border-radius: 4px; -khtml-border-radius: 4px;"
												
											
                        bgcolor="#FFA500"><a target="_blank" style=";
					color: #FFFFFF; font-family: sans-serif; font-size: 17px; font-weight: 400; line-height: 120%; text-decoration: none" href="${
            AppConfig.siteUrl
          }/${data.url || "#"}">
						${data.linkText || "View"}
					</a>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%;
			padding-top: 25px;" class="line">
            </td>
          </tr>
          <tr>
           
        </table>
        <table border="0" cellpadding="0" cellspacing="0" align="center" width="560" style="border-collapse: collapse; border-spacing: 0; padding: 0; width: inherit;
	max-width: 560px;" class="wrapper">
          <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 13px; font-weight: 400; line-height: 150%;
			padding-top: 20px;
			padding-bottom: 20px;
			color: #999999;
			font-family: sans-serif;" class="footer">
              Check out our extensive <a href="#" target="_blank" style="text-decoration: underline; color: #999999; font-family: sans-serif; font-size: 13px; font-weight: 400; line-height: 150%;">FAQ</a> for more information
              or contact us through our <a href="#" target="_blank" style="text-decoration: underline; color: #999999; font-family: sans-serif; font-size: 13px; font-weight: 400; line-height: 150%;">Contact Form</a>. Our support
              team is available to help you 24 hours a day, seven days a week.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    html: email,
    text: stringData,
    subject: data.title || "MYAO Notification",
  };
};
