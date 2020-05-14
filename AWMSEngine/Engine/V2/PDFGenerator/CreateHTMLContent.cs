using AMWUtil.Common;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using DinkToPdf;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.PDFGenerator
{
    public class CreateHTMLContent
    {
        public class HeadAttrModel
        {
            public int order;
            public string head_name;
            public string head_key;
        };
        
        public class GroupLayout
        {
            public long pageSeq;
            public List<ams_PrintLayout> printLayout;
        };
        public class HtmlPaper
        {
            public decimal widthCM;
            public decimal heightCM;
            public StringBuilder style;
            public string div_begin;
            public List<HtmlPage> contents;
            public string div_end;
            public string div_full_content
            {
                get =>
                div_begin +
                string.Join(' ', this.contents.Select(x => x.div_full_content).ToArray()) +
                div_end;
            }
            public string style_all {
                get => style.ToString() + string.Join(' ', this.contents.Select(x => x.style_contents).ToArray());
            }
        }
        public class HtmlPage
        {
            public decimal widthCM;
            public decimal heightCM;
            public StringBuilder style;
            public string div_begin;
            public List<HtmlContent> contents;
            public string div_end;
            public string div_full_content { get =>
                    div_begin + 
                    string.Join(' ',this.contents.Select(x=>x.div_page_full_content).ToArray()) + 
                    div_end; }
            public string style_contents
            {
                get => string.Join(' ', this.contents.Select(x => x.style.ToString()).ToArray());
            }
        }
        public class HtmlContent
        {
            public decimal? heightCM;
            public StringBuilder style;
            public StringBuilder content;
            public string div_page_begin;
            public string div_page_end;
            public string div_page_full_content { get => div_page_begin + content.ToString() + div_page_end; }
        }


        public HtmlPaper newHtmlPaper(ams_PrintForm _printForm)
        {
            var htmlPaper = new HtmlPaper();
            var style = new StringBuilder();
            if (_printForm.MainStyle != null)
            {
                style.Append(_printForm.MainStyle);
            }

            htmlPaper.style = style;
            htmlPaper.widthCM = _printForm.PaperWidthCM.Value;
            htmlPaper.heightCM = _printForm.PaperHeightCM.Value;
            htmlPaper.div_begin = "<div>";
            //htmlPaper.div_begin = "<div style='border: 1px solid blue; width: " + _printForm.PaperWidthCM.Value + "cm; "
            //    +"height: "+ _printForm.PaperHeightCM.Value + "cm;'>";
            htmlPaper.div_end = "</div>";
            return htmlPaper;
        }
        public HtmlPage newHtmlPage(ams_PrintForm _printForm)
        {
            var htmlPage = new HtmlPage();

            htmlPage.widthCM = _printForm.PageWidthCM.Value;
            htmlPage.heightCM = _printForm.PageHeightCM.Value;

            var stylePaddMarg = new StringBuilder();
            if (_printForm.PagePaddingCM != null || _printForm.PageMarginCM != null)
            { 
                if (_printForm.PagePaddingCM != null)
                {
                    stylePaddMarg.AppendFormat("padding: {0}cm;", _printForm.PagePaddingCM.ToString());
                }
                //if (_printForm.PageMarginCM != null)
                //{
                //    stylePaddMarg.AppendFormat("margin: {0}cm;", _printForm.PageMarginCM.ToString());
                //} border: 1px solid green; 
            }
            htmlPage.div_begin = "<div style='" + stylePaddMarg.ToString() + "width:" + _printForm.PageWidthCM.Value + "cm; "
                + "height: " + _printForm.PageHeightCM.Value + "cm;'>";
            htmlPage.div_end = "</div>";
            return htmlPage;                                                                                                                                                             return htmlPage;
        }
        public bool checkNeedNewPage(HtmlPaper htmlPaper,HtmlPage htmlPage)
        {
            decimal sumHeight = 0;
            decimal sumWidth = 0;
            foreach(var p in htmlPaper.contents)
            {
                if (sumWidth + p.widthCM > htmlPaper.widthCM)
                {
                    sumWidth = p.widthCM;
                    sumHeight += p.heightCM;
                }
                else
                {
                    sumWidth += p.widthCM;
                    sumHeight += p.heightCM;
                }
            }

            return sumHeight > htmlPaper.heightCM;
        }

        public HtmlToPdfDocument createHtmlToPdfDocument<T>(string formCode, T param)
            where T : new()
        {
            List<HtmlPaper> pdfHtmlPapers = new List<HtmlPaper>();

            List<string> itemsHTML = new List<string>();
            var _printForm = StaticValueManager.GetInstant().PrintForm.FirstOrDefault(x => x.Code == formCode);
            var _printLayout = StaticValueManager.GetInstant().PrintLayout.FindAll(x => x.PrintForm_ID == _printForm.ID.Value);
            
            if(_printLayout != null && _printLayout.Count() > 0)
            {

                var group_Layout = _printLayout.GroupBy(x => new { x.PrintForm_ID, x.PageSeq })
                .Select(gcs => new GroupLayout()
                 {
                     pageSeq = gcs.Key.PageSeq.Value,
                     printLayout = gcs.ToList()
                 }).OrderBy(x=>x.pageSeq);
                foreach (var group in group_Layout)
                {

                    HtmlPaper htmlPaper = newHtmlPaper(_printForm);
                    HtmlPaper htmlPaper_First = htmlPaper;

                    pdfHtmlPapers.Add(htmlPaper);
                    HtmlPage htmlPage = newHtmlPage(_printForm);
                    htmlPaper.contents = new List<HtmlPage>() { htmlPage };
                    HtmlContent htmlContent = null;

                    void _process_content(ams_PrintLayout _printLayout)
                    {
                        htmlContent = GenContent(_printLayout, param);
                        if (htmlPage.contents != null && htmlPage.contents.Sum(x => x.heightCM) + htmlContent.heightCM > htmlPage.heightCM)
                        {
                            htmlPage = newHtmlPage(_printForm);
                            htmlPage.contents = new List<HtmlContent>() { htmlContent };
                            if (checkNeedNewPage(htmlPaper, htmlPage))
                            {
                                htmlPaper = newHtmlPaper(_printForm);
                                drawLayer(PrintLayoutType.HEADER_ALL);
                                pdfHtmlPapers.Add(htmlPaper);
                            }
                            htmlPaper.contents = new List<HtmlPage>() { htmlPage };
                        }
                        else
                        {
                            if (htmlPage.contents != null)
                            {
                                htmlPage.contents.Add(htmlContent);
                            }
                            else
                            {
                                htmlPage.contents = new List<HtmlContent>() { htmlContent };
                            }
                        }
                    }

                    void drawLayer(PrintLayoutType pt)
                    {
                        foreach (var printLayout in group.printLayout.FindAll(x => x.PrintLayoutType == pt))
                        {
                            _process_content(printLayout);
                        }
                    }

                    drawLayer(PrintLayoutType.HEADER_ALL);
                    drawLayer(PrintLayoutType.HEADER_FIRSTPAGE);
                    drawLayer(PrintLayoutType.BODY);
                    drawLayer(PrintLayoutType.FOOTER_LASTPAGE);
                }


                    itemsHTML = GenHTMLString(pdfHtmlPapers);



            }
            var MarginSettings = new MarginSettings();
            if (_printForm.PageMarginCM != null) {
                var margins = (double)_printForm.PageMarginCM.Value;
                MarginSettings = new MarginSettings
                {
                    Top = margins,
                    Bottom = margins,
                    Right = margins,
                    Left = margins,
                    Unit = Unit.Centimeters
                };
            }
            HtmlToPdfDocument pdf = new HtmlToPdfDocument()
            {
                GlobalSettings =  {
                    ColorMode = ColorMode.Color,
                    //Orientation = Orientation.Portrait,
                    PaperSize = new PechkinPaperSize(_printForm.PaperWidthCM.ToString()+"cm", _printForm.PaperHeightCM.ToString() + "cm"),
                    Margins = MarginSettings,
                    DocumentTitle = "PDF Report",
                    //Out = fileName
                } 
            };
            //ตัวอย่างค่า Settings ที่เก็บใน DB
            //HeaderSettings = { "FontSize":9, "Right":"Page [page] of [toPage]", "Line" : true }
            //FooterSettings = { "FontSize": 9, "Line": true, "Center": "Report Footer" }
            //var HeaderSettings = _printForm.HeaderSettings != null ? JsonConvert.DeserializeObject<HeaderSettings>(_printForm.HeaderSettings) : null;
            //var FooterSettings = _printForm.FooterSettings != null ? JsonConvert.DeserializeObject<FooterSettings>(_printForm.FooterSettings) : null;
            foreach (var item in itemsHTML)
            {
                var page = new ObjectSettings()
                {
                    PagesCount = true,
                    WebSettings = { DefaultEncoding = "utf-8"
                    , UserStyleSheet = Path.Combine(Directory.GetCurrentDirectory(), "assets", "styles.css")
                    },
                    HtmlContent = item,
                    HeaderSettings = { FontSize = 9, Right = "Page [page] of [toPage]", Line = true },
                    FooterSettings = { FontSize = 9, Line = true, Center = "Report Footer" }
                    //HeaderSettings = HeaderSettings,
                    //FooterSettings = FooterSettings
                };
                pdf.Objects.Add(page);
            }

            return pdf;
        }
        private static List<string> GenHTMLString(List<HtmlPaper> htmlPapers)
        {
            List<string> htmlAlls = new List<string>();
            foreach(var item in htmlPapers)
            {
                var htmlAll = new StringBuilder();
                htmlAll.AppendFormat(@"
                       <html>
                            <head>
                                <style type='text/css'>{0}</style>
                            </head>
                            <body>{1}</body>
                        </html>                                  
                        ", item.style_all.ToString(), item.div_full_content.ToString());
                var _HtmlContent = htmlAll.ToString();
                htmlAlls.Add(_HtmlContent);
            }

            return htmlAlls;

        }
        

        private HtmlContent GenContent<T>(ams_PrintLayout _PrintLayouts, T param)
        {
            var temp_content = new StringBuilder();
            var selContentLayout = _PrintLayouts;
           
            var _printFieldSel = StaticValueManager.GetInstant().PrintField.FindAll(x => x.PrintLayout_ID == selContentLayout.ID.Value).OrderBy(x => x.FieldSeq).ToList();
            var styleTopLeft = new StringBuilder();
            if (_PrintLayouts.PageTopCM != null || _PrintLayouts.PageLeftCM != null)
            {
                styleTopLeft.Append("position: absolute;");
                if (_PrintLayouts.PageTopCM != null)
                {

                    styleTopLeft.AppendFormat("top: {0}cm;", _PrintLayouts.PageTopCM.ToString());
                }
                if (_PrintLayouts.PageLeftCM != null)
                {
                    styleTopLeft.AppendFormat("left: {0}cm;", _PrintLayouts.PageLeftCM.ToString());
                } 
            }
            var heightContent = _PrintLayouts.PageHeightCM != null ? "height: " + _PrintLayouts.PageHeightCM.Value + "cm;" : "";
            var PrintContent = new HtmlContent();
            PrintContent.div_page_begin = "<div class='" + selContentLayout.LayoutClass + "' "
                + "style='" + styleTopLeft.ToString()
                + heightContent + "' >";
            var genContent = GenPrintFields(_printFieldSel, param);
            PrintContent.content = genContent.content;
            PrintContent.div_page_end = "</div>";
            PrintContent.style = genContent.style;
            PrintContent.heightCM = _PrintLayouts.PageHeightCM;

            return PrintContent;
        }
         
        private HtmlContent GenPrintFields<T>(List<ams_PrintField> _PrintFields, T param)
        {
            var PrintContentFields = new HtmlContent();
            var temp_body = new StringBuilder();
            var style = new StringBuilder();

            foreach (var rowField in _PrintFields)
            {
                FieldType fieldType = EnumUtil.GetValueEnum<FieldType>(rowField.FieldType.ToString());

                string idCSS = fieldType + "_" + rowField.ID.ToString();

                if (rowField.FieldStyle != null)
                {
                    style.Append(" #" + idCSS + " {" + rowField.FieldStyle + "}");
                }
                var styleTopLeft =  new StringBuilder();
                if (rowField.PageAreaTopCM != null || rowField.PageAreaLeftCM != null)
                { 
                    styleTopLeft.Append("style='position: absolute;");
                    if (rowField.PageAreaTopCM != null)
                    {

                        styleTopLeft.AppendFormat("top: {0}cm;", rowField.PageAreaTopCM.ToString());
                    }
                    if (rowField.PageAreaLeftCM != null)
                    {
                        styleTopLeft.AppendFormat("left: {0}cm;", rowField.PageAreaLeftCM.ToString());
                    }
                    styleTopLeft.Append("'");
                }
                

                if (rowField.FieldType == AWMSModel.Constant.EnumConst.FieldType.LABEL)
                {
                    string field = rowField.Value.Trim('{', '}');
                    dynamic itemValue = typeof(T).GetField(field).GetValue(param);
                    temp_body.AppendFormat(@"<p id='{0}' class='{1}' {2}>{3}</p>", idCSS, rowField.FieldClass, styleTopLeft.ToString(), itemValue);
                }
                else if (rowField.FieldType == AWMSModel.Constant.EnumConst.FieldType.TABLE)
                {
                    string field = rowField.Value.Trim('{', '}');
                    dynamic itemValue = typeof(T).GetField(field).GetValue(param);
                    object itemHead = itemValue[0];
                    var tableHead = itemHead.GetType();

                    temp_body.AppendFormat(@"<table id='{0}' class='{1}' {2}><tr>", idCSS, rowField.FieldClass, styleTopLeft.ToString());

                    List<HeadAttrModel> headAttrs = new List<HeadAttrModel>();
                    foreach (var rowH in tableHead.GetFields())
                    {
                        var dispAttr = AMWUtil.Common.AttributeUtil.Attribute<DisplayAttribute>(rowH);
                        if (dispAttr != null)
                            headAttrs.Add(new HeadAttrModel() { order = dispAttr.Order, head_name = dispAttr.Name, head_key = rowH.Name });
                    }
                    foreach (var rowH in tableHead.GetProperties())
                    {
                        var dispAttr = AMWUtil.Common.AttributeUtil.Attribute<DisplayAttribute>(rowH);
                        if (dispAttr != null)
                            headAttrs.Add(new HeadAttrModel() { order = dispAttr.Order, head_name = dispAttr.Name, head_key = rowH.Name });
                    }
                    foreach (var headAttr in headAttrs.OrderBy(x => x.order))
                    {
                        temp_body.AppendFormat(@"<th>{0}</th>", headAttr.head_name);
                    }

                    temp_body.Append(@"</tr>");
                    foreach (var row in itemValue)
                    {
                        temp_body.Append(@"<tr>");

                        foreach (var headAttr in headAttrs.OrderBy(x => x.order))
                        {
                            temp_body.AppendFormat(@"<td>{0}</td>", row.GetType().GetField(headAttr.head_key).GetValue(row) ?? "");
                        }
                        temp_body.Append(@"</tr>");
                    }

                    temp_body.Append(@"</table></br>");
                }
                else if (rowField.FieldType == AWMSModel.Constant.EnumConst.FieldType.IMG)
                {
                    temp_body.AppendFormat(@"<img id='{0}' src='{1}' alt ='{2}' class='{3}' {4}>
                                    </img>", idCSS, rowField.Value, idCSS, rowField.FieldClass, styleTopLeft.ToString());
                }
            }
            PrintContentFields.style = style;
            PrintContentFields.content = temp_body;
            return PrintContentFields;
        }
    }
}
