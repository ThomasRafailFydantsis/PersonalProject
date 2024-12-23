//using PdfSharpCore.Drawing;
//using PdfSharpCore.Pdf;
//using PersonalProject.Server.Models;
//using System.IO;

//public static class CertificateGenerator
//{
//    public static byte[] GeneratePdf(UserCertificate userCertificate)
//    {
//        using (var memoryStream = new MemoryStream())
//        {
//            // Create a new PDF document
//            var document = new PdfDocument();

//            // Add a new page to the document
//            var page = document.AddPage();

//            // Create a graphics object to draw on the page
//            var graphics = XGraphics.FromPdfPage(page);

//            // Set up a font for drawing text
//            var font = new XFont("Verdana", 20, XFontStyle.Bold);

//            // Draw the certificate content
//            graphics.DrawString($"Certificate of Completion for {userCertificate.User.FirstName} {userCertificate.User.LastName}", font, XBrushes.Black, new XPoint(50, 50));
//            graphics.DrawString($"Certificate Name: {userCertificate.Certificate.CertName}", font, XBrushes.Black, new XPoint(50, 100));
//            graphics.DrawString($"Date: {userCertificate.DateTaken?.ToString("yyyy-MM-dd")}", font, XBrushes.Black, new XPoint(50, 150));

//            // Save the document to the memory stream
//            document.Save(memoryStream);

//            // Return the PDF as a byte array
//            return memoryStream.ToArray();
//        }
//    }
//}