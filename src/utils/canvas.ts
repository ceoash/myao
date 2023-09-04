import { toast } from "react-hot-toast";
import { AppConfig } from "./AppConfig";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";


export const handleCopy = (username: string) => {
    navigator.clipboard.writeText(
      `${AppConfig.siteUrl || "http://localhost:3000"}/connect/${username}`
    );
    toast.success("Link copied to clipboard");
  };

 export const handleDownloadQR = () => {
    const qrCodeElement = document.querySelector("canvas");

    if (!qrCodeElement) {
      return;
    }

    html2canvas(qrCodeElement).then((canvas) => {
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, "qr-code.png");
        }
      });
    });
  };