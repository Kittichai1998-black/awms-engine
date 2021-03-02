﻿using AMSModel.Constant.EnumConst;
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


        public string DV_Set_SouLoc;
        public float DV_Set_PalletUnit;
        public string DV_Set_ShtDi;
        public string DV_Set_Hand;
        public string DV_Set_DesLoc;
        public string DV_Set_CurLoc;
        public float DV_Set_Unit;
        public float DV_Set_PalletID;
        public float DV_Set_Row;
        public float DV_Set_Weigh;
        public float DV_Set_Comm;

        public string DV_Con_SouLoc;
        public float DV_Con_PalletUnit;
        public string DV_Con_ShtDi;
        public string DV_Con_Hand;
        public string DV_Con_DesLoc;
        public float DV_Con_Unit;
        public float DV_Con_PalletID;
        public float DV_Con_Weigh;
        public float DV_Con_Comm;
        public string DV_Con_CurLoc;

        public string DV_Pre_SouLoc;
        public string DV_Pre_DesLoc;
        public string DV_Pre_CurLoc;
        public float DV_Pre_Comm;
        public string DV_Pre_BarPallet;
        public string DV_Pre_BarProd;
        public float DK_Pre_Status;
        public float DK_Pre_Unit;
        public float DK_Pre_PalletID;
        public float DK_Pre_Weigh;

    }
}
