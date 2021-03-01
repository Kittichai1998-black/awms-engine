using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
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
        public List<acs_Location> McPositions { get; set; }
        public List<acv_McPositionRouteVisible> McPositionRoutes { get; set; }
        public List<act_McObject> McObjects { get; set; }

        public Font drawFont { get; set; }
        public StringFormat drawFormat { get; set; }

        public formSimulation(VOCriteria buVO)
        {
            this.BuVO = buVO;

            this.drawFont = new System.Drawing.Font("Arial", 5);
            this.drawFormat = new System.Drawing.StringFormat();
            this.drawFormat.LineAlignment = StringAlignment.Center;
            this.drawFormat.Alignment = StringAlignment.Center;

            InitializeComponent();
        }

        private void formSimulation_Load(object sender, EventArgs e)
        {
            this.splitContainer1.SplitterDistance = this.splitContainer1.Width - 400;
            this.Reload_Form();
        }

        private void Reload_Form()
        {
            this.McPositions = ADO.WCSDB.DataADO.GetInstant().SelectBy<acs_Location>(
                new SQLConditionCriteria[] { 
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("DrawVisible",EntityStatus.ACTIVE, SQLOperatorType.EQUALS)}, BuVO);

            this.McPositionRoutes = ADO.WCSDB.DataADO.GetInstant().SelectBy<acv_McPositionRouteVisible>(
                new SQLConditionCriteria("Status", "1", SQLOperatorType.IN), BuVO);

            this.McObjects = ADO.WCSDB.DataADO.GetInstant().SelectBy<act_McObject>(
                new SQLConditionCriteria("Status", "1", SQLOperatorType.IN), BuVO);


            this.panelSimu.Invalidate();
            //this.panelSimu.Update();
            this.panelSimu.Refresh();
        }

        private void panelSimu_Paint(object sender, PaintEventArgs e)
        {
            Graphics g = e.Graphics;

            this.print_PositionBlock(g);
            this.print_PositionRoute(g);
            this.print_McObject(g);

        }
        private void print_PositionBlock(Graphics g)
        {
            foreach (var mcPos in this.McPositions)
            {
                g.FillRectangle(Brushes.Red, new Rectangle(mcPos.DrawPosX, mcPos.DrawPosY, PropertySimulation.block_w, PropertySimulation.block_h));
                g.FillRectangle(
                    this.McObjects.Any(x=>x.Cur_Location_ID == mcPos.ID)?
                        Brushes.DarkBlue:Brushes.Black, 
                    new Rectangle(
                        mcPos.DrawPosX + PropertySimulation.block_border,
                        mcPos.DrawPosY + PropertySimulation.block_border,
                        PropertySimulation.block_w - (PropertySimulation.block_border * 2), 
                        PropertySimulation.block_h - (PropertySimulation.block_border * 2)));
                g.DrawString("<<" + mcPos.GroupName + ">>", drawFont, Brushes.White, (float)mcPos.DrawPosX + (PropertySimulation.block_w/2), (float)mcPos.DrawPosY + (int)(PropertySimulation.block_h * 0.20), drawFormat);
                g.DrawString(mcPos.Code + " (" + mcPos.ID + ")", drawFont, Brushes.White, (float)mcPos.DrawPosX + (PropertySimulation.block_w / 2), (float)mcPos.DrawPosY + (int)(PropertySimulation.block_h * 0.50), drawFormat);
                g.DrawString(mcPos.DrawPosX +","+mcPos.DrawPosY, drawFont, Brushes.White, (float)mcPos.DrawPosX + (PropertySimulation.block_w / 2), (float)mcPos.DrawPosY + (int)(PropertySimulation.block_h * 0.75), drawFormat);

            };
        }
        private void print_PositionRoute(Graphics g)
        {

            foreach (var mcRoute in this.McPositionRoutes)
            {
                Point pSou = this.McPositions.Where(x => x.ID == mcRoute.Sou_Location_ID).Select(x => new Point(x.DrawPosX, x.DrawPosY)).First();
                Point pDes = this.McPositions.Where(x => x.ID == mcRoute.Des_Location_ID).Select(x => new Point(x.DrawPosX, x.DrawPosY)).First();

                //pSou.X += 50;
                //pSou.Y += 50;
                //pDes.X += 50;
                //pDes.Y += 50;

                int x = pDes.X - pSou.X;
                int y = pDes.Y - pSou.Y;

                ////////////////////////////// ตูดลูกศร

                if (x <= 0 && Math.Abs(x) >= Math.Abs(y))//left
                {
                    pSou.Y += PropertySimulation.block_h/2 + PropertySimulation.arrow_size;
                    pSou.X -= PropertySimulation.arrow_margin;
                }
                else if (x >= 0 && Math.Abs(x) >= Math.Abs(y))//right
                {
                    pSou.X += PropertySimulation.block_w+ PropertySimulation.arrow_margin;
                    pSou.Y += PropertySimulation.block_h/ 2 - PropertySimulation.arrow_size;
                }
                else if (y <= 0 && Math.Abs(y) >= Math.Abs(x))//top
                {
                    pSou.X += PropertySimulation.block_w/ 2 - PropertySimulation.arrow_size; ;
                    pSou.Y -= PropertySimulation.arrow_margin;
                }
                else if (y >= 0 && Math.Abs(y) >= Math.Abs(x))//bottom
                {
                    pSou.X += PropertySimulation.block_w/ 2 + PropertySimulation.arrow_size;
                    pSou.Y += PropertySimulation.block_h+ PropertySimulation.arrow_margin; ;
                }

                ////////////////////////////// หัวลูกศร

                if (x <= 0 && Math.Abs(x) >= Math.Abs(y))//right
                {
                    pDes.X += PropertySimulation.block_w + PropertySimulation.arrow_margin;
                    pDes.Y += PropertySimulation.block_h/ 2 + PropertySimulation.arrow_size;
                }
                else if (x >= 0 && Math.Abs(x) >= Math.Abs(y) + PropertySimulation.block_h)//left
                {
                    pDes.X -= PropertySimulation.arrow_margin;
                    pDes.Y += PropertySimulation.block_h / 2 - PropertySimulation.arrow_size;
                }
                else if (y >= 0 && Math.Abs(y) >= Math.Abs(x))//top
                {
                    pDes.X += PropertySimulation.block_w/2 + PropertySimulation.arrow_size;
                    pDes.Y -= PropertySimulation.arrow_margin;
                }
                else if (y <= 0 && Math.Abs(y) >= Math.Abs(x))//bottom
                {
                    pDes.X += PropertySimulation.block_w/2 - PropertySimulation.arrow_size;
                    pDes.Y += PropertySimulation.block_h+ PropertySimulation.arrow_margin;
                }
                Pen pen = new Pen(Brushes.Red, PropertySimulation.arrow_size);
                pen.StartCap = System.Drawing.Drawing2D.LineCap.ArrowAnchor;
                g.DrawLine(pen, pDes, pSou);
            }

        }
        private void print_McObject(Graphics g)
        {
            using (var brush = new SolidBrush(Color.FromArgb(150, 0, 0, 255)))
            {
                Pen pen = new Pen(brush, 3);
                pen.StartCap = System.Drawing.Drawing2D.LineCap.Flat;
                foreach (var mcObj in this.McObjects)
                {
                    string txtObj = "";//mcObj.Code + " : " + mcObj.Status;
                    string txtWQ = "";//mcObj.Code + " : " + mcObj.Status;
                    var mcPos = this.McPositions.Find(x => x.ID == mcObj.Cur_Location_ID);
                    g.DrawLine(pen,
                        new Point(mcPos.DrawPosX + (PropertySimulation.block_w + PropertySimulation.block_border * 2), mcPos.DrawPosY + (PropertySimulation.block_h + PropertySimulation.block_border * 2)),
                        new Point(mcPos.DrawPosX + (PropertySimulation.block_w), mcPos.DrawPosY + (PropertySimulation.block_h)));
                    g.FillRectangle(brush,
                        new Rectangle(
                            mcPos.DrawPosX + (PropertySimulation.block_w + PropertySimulation.block_border * 2),
                            mcPos.DrawPosY + (PropertySimulation.block_h + PropertySimulation.block_border * 2),
                            txtObj.Length * 7, 40));
                    g.DrawString(txtObj, drawFont, Brushes.White, 3+(float)mcPos.DrawPosX + (PropertySimulation.block_w + PropertySimulation.block_border * 2), 3+(float)mcPos.DrawPosY + (PropertySimulation.block_h + PropertySimulation.block_border * 2));
                    g.DrawString(txtWQ, drawFont, Brushes.White, 3 + (float)mcPos.DrawPosX + (PropertySimulation.block_w + PropertySimulation.block_border * 2), 23 + (float)mcPos.DrawPosY + (PropertySimulation.block_h + PropertySimulation.block_border * 2));

                }
            }
        }

        private void button1_Click(object sender, EventArgs e)
        {
            this.Reload_Form();
        }
    }
}
