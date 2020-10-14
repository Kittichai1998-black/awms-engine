using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Windows.Forms;

namespace AWCSEngine
{
    public partial class formSimulation : Form
    {
        public VOCriteria BuVO { get; set; }
        List<acs_McPosition> McPositions { get; set; }
        List<acs_McPositionRoute> McPositionRoutes { get; set; }

        public formSimulation(VOCriteria buVO)
        {
            this.BuVO = buVO;

            InitializeComponent();
        }

        private void formSimulation_Load(object sender, EventArgs e)
        {
            this.splitContainer1.SplitterDistance = this.splitContainer1.Width - 400;
            this.Reload_Form();
        }

        private void Reload_Form()
        {
            this.McPositions = ADO.WCSDB.DataADO.GetInstant().SelectBy<acs_McPosition>("status", EntityStatus.ACTIVE, BuVO);
            this.McPositionRoutes = ADO.WCSDB.DataADO.GetInstant().SelectBy<acs_McPositionRoute>("status", EntityStatus.ACTIVE, BuVO);


            this.panelSimu.Invalidate();
            this.panelSimu.Update();
            this.panelSimu.Refresh();
        }

        private void panelSimu_Paint(object sender, PaintEventArgs e)
        {

            Font drawFont = new System.Drawing.Font("Arial", 5);
            SolidBrush drawBrush = new System.Drawing.SolidBrush(System.Drawing.Color.Black);
            StringFormat drawFormat = new System.Drawing.StringFormat();
            drawFormat.LineAlignment = StringAlignment.Center;
            drawFormat.Alignment = StringAlignment.Center;

            Graphics g = e.Graphics;
            foreach (var mcPos in this.McPositions)
            {
                g.FillRectangle(Brushes.Red, new Rectangle(mcPos.DrawPosX, mcPos.DrawPosY, 100, 100));
                g.FillRectangle(Brushes.Silver, new Rectangle(mcPos.DrawPosX+3, mcPos.DrawPosY+3, 94, 94));
                g.DrawString("<<"+mcPos.GroupCode+">>", drawFont, Brushes.Black, (float)mcPos.DrawPosX + 50, (float)mcPos.DrawPosY + 30, drawFormat);
                g.DrawString(mcPos.Code+" ("+mcPos.ID+")", drawFont, Brushes.Black, (float)mcPos.DrawPosX + 50, (float)mcPos.DrawPosY + 55, drawFormat);

            };

            foreach (var mcRoute in this.McPositionRoutes)
            {
                Point pSou = this.McPositions.Where(x => x.ID == mcRoute.Sou_McPosition_ID).Select(x => new Point(x.DrawPosX, x.DrawPosY)).First();
                Point pDes = this.McPositions.Where(x => x.ID == mcRoute.Des_McPosition_ID).Select(x => new Point(x.DrawPosX, x.DrawPosY)).First();


                //pSou.X += 50;
                //pSou.Y += 50;
                //pDes.X += 50;
                //pDes.Y += 50;

                int x = pDes.X - pSou.X;
                int y = pDes.Y - pSou.Y;

                if (x <= 0 && Math.Abs(x) >= Math.Abs(y))//left
                {
                    pSou.Y += 50;
                }
                else if (x >= 0 && Math.Abs(x) >= Math.Abs(y))//right
                {
                    pSou.X += 100;
                    pSou.Y += 50;
                }
                else if (y <= 0 && Math.Abs(y) >= Math.Abs(x))//top
                {
                    pSou.X += 50;
                }
                else if (y >= 0 && Math.Abs(y) >= Math.Abs(x))//bottom
                {
                    pSou.X += 50;
                    pSou.Y += 100;
                }

                //////////////////////////////

                if (x <= 0 && Math.Abs(x) >= Math.Abs(y))//left
                {
                    pDes.X += 100;
                    pDes.Y += 50;
                }
                else if (x >= 0 && Math.Abs(x) >= Math.Abs(y))//right
                {
                    pDes.Y += 50;
                }
                else if (y >= 0 && Math.Abs(y) >= Math.Abs(x))//top
                {
                    pDes.X += 50;
                }
                else if (y <= 0 && Math.Abs(y) >= Math.Abs(x))//bottom
                {
                    pDes.X += 50;
                    pDes.Y += 100;
                }
                Pen pen = new Pen(Brushes.Red, 10);
                pen.StartCap = System.Drawing.Drawing2D.LineCap.ArrowAnchor;
                g.DrawLine(pen, pDes, pSou);
            }

        }

        private void button1_Click(object sender, EventArgs e)
        {
            this.Reload_Form();
        }
    }
}
