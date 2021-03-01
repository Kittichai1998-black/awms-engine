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
        public long? Cur_Location_ID;
        public McObjectEventStatus EventStatus;


        public int DV_Set_Comm;
        public int DV_Con_Comm;
        public int DV_Pre_Comm;

        public int DV_Pre_Status;

        public int DV_Set_Unit;
        public int DV_Con_Unit;
        public int DV_Pre_Unit;

        public float DV_Pre_WeiKG;

        public string DV_Pre_BarPallet;
        public string DV_Pre_BarProd;

        public string DV_Set_PalletID;
        public string DV_Con_PalletID;
        public string DV_Pre_PalletID;
        public int DV_Set_Weigh;
        public int DV_Con_Weigh;
        public int DV_Pre_Weigh;

        public int DV_Set_SouLoc;
        public int DV_Con_SouLoc;
        public int DV_Pre_SouLoc;
        public int DV_Set_DesLoc;
        public int DV_Con_DesLoc;
        public int DV_Pre_DesLoc;
        public int DV_Set_CurLoc;
        public int DV_Con_CurLoc;
        public int DV_Pre_CurLoc;

    }
}
