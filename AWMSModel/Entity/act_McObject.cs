using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class act_McObject : BaseEntityCreateModify
    {
        public string CommandTypeName;
        public long? Command_ID;
        public int? CommandAction_Seq;
        public long? StoObject_ID;
        public long? Sou_Location_ID;
        public long? Des_Location_ID;
        public long? Location_ID;
        public McObjectEventStatus EventStatus;


        public short DV_Set_Comm;
        public short DV_Con_Comm;
        public short DV_Pre_Comm;

        public short DV_Pre_Status;

        public short DV_Set_Unit;
        public short DV_Con_Unit;
        public short DV_Pre_Unit;

        public float DV_Pre_WeiKG;

        public string DV_Pre_BarPallet;
        public string DV_Pre_BarProd;


        public string DV_Set_SouLoc;
        public string DV_Con_SouLoc;
        public string DV_Pre_SouLoc;
        public string DV_Set_DesLoc;
        public string DV_Con_DesLoc;
        public string DV_Pre_DesLoc;
        public string DV_Set_CurLoc;
        public string DV_Con_CurLoc;
        public string DV_Pre_CurLoc;

    }
}
