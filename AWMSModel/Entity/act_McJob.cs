using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
	public class act_McJob
	{
		public int Priority;
		public string Code;
		public int McObject_ID;
		public int McFunction_ID;
		public long CheckedMcWorkQueue_ID;
		public long CheckedCall_McJob_ID;
		public long CheckedNext_McJob_ID;
		public string DataRequet;
		public string DataActual;
		public string DataDone;
		public McJobEventStatus EventStatus;

	}
}
