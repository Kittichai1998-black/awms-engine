using AWCSModel.Criteria;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace AWCSEngine
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        public List<RouteLineCriteria> RouteLines;

        public void InitData()
        {
            this.RouteLines = new List<RouteLineCriteria>();
            this.RouteLines.Add(new RouteLineCriteria() { ID = 1, AreaCode = "Z", LocationCode = "L01", MaxMchineBuffer = -1, Machines = new List<BaseMachineObjectCriteria>(), NextRouteLines = new List<RouteLineCriteria>() });
            this.RouteLines.Add(new RouteLineCriteria() { ID = 2, AreaCode = "Z", LocationCode = "L02", MaxMchineBuffer = -1, Machines = new List<BaseMachineObjectCriteria>(), NextRouteLines = new List<RouteLineCriteria>() });
            this.RouteLines.Add(new RouteLineCriteria() { ID = 3, AreaCode = "Z", LocationCode = "L03", MaxMchineBuffer = -1, Machines = new List<BaseMachineObjectCriteria>(), NextRouteLines = new List<RouteLineCriteria>() });
            this.RouteLines.Add(new RouteLineCriteria() { ID = 4, AreaCode = "Z", LocationCode = "L04", MaxMchineBuffer = -1, Machines = new List<BaseMachineObjectCriteria>(), NextRouteLines = new List<RouteLineCriteria>() });
            this.RouteLines[0].NextRouteLines.Add(this.RouteLines[1]);
            this.RouteLines[1].NextRouteLines.Add(this.RouteLines[2]);
            this.RouteLines[2].NextRouteLines.Add(this.RouteLines[3]);
            this.RouteLines[3].NextRouteLines.Add(this.RouteLines[0]);
        }
    }
}
