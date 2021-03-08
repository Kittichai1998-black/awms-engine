﻿using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
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
        public long? CommandAction_ID;
        public string CommandAction_Condition;
        public string CommandAction_Set;
        public long? BaseObject_ID;
        public long? Sou_Location_ID;
        public long? Des_Location_ID;
        public long? Cur_Location_ID;
        public McObjectEventStatus EventStatus;


        public int DV_Set_SouLoc;
        public int DV_Set_PalletUnit;
        public int DV_Set_ShtDi;
        public int DV_Set_Hand;
        public int DV_Set_DesLoc;
        public int DV_Set_CurLoc;
        public int DV_Set_Unit;
        public string DV_Set_PalletID;
        public int DV_Set_Row;
        public int DV_Set_Weigh;
        public int DV_Set_Comm;

        public int DV_Con_SouLoc;
        public int DV_Con_PalletUnit;
        public int DV_Con_ShtDi;
        public int DV_Con_Hand;
        public int DV_Con_DesLoc;
        public int DV_Con_Unit;
        public string DV_Con_PalletID;
        public int DV_Con_Weigh;
        public int DV_Con_Comm;
        public int DV_Con_CurLoc;

        public int DV_Pre_SouLoc;
        public int DV_Pre_DesLoc;
        public int DV_Pre_CurLoc;
        public int DV_Pre_Comm;
        public string DV_Pre_BarPallet;
        public string DV_Pre_BarProd;
        public int DV_Pre_Status;
        public int DV_Pre_Unit;
        public string DV_Pre_PalletID;
        public int DV_Pre_Weigh;
        public int DV_Pre_Zone;
        public string DV_Pre_RowLevel;
        public string DV_Pre_PalletCount;
        public string DV_Pre_ShtDi;
 

    }
}
