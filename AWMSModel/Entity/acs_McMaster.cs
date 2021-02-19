using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class acs_McMaster : BaseEntitySTD
    {
        public string NameEngine;
        public int ThreadIndex;
        public PlcCommunicationType PlcCommuType;
        public string LogicalNumber;

        public string DK_Set_SouLoc;
        public int VW_Set_SouLoc;

        public string DK_Con_SouLoc;
        public int VW_Con_SouLoc;

        public string DK_Pre_SouLoc;
        public int VW_Pre_SouLoc;

        public string DK_Set_DesLoc;
        public int VW_Set_DesLoc;

        public string DK_Con_DesLoc;
        public int VW_Con_DesLoc;

        public string DK_Pre_DesLoc;
        public int VW_Pre_DesLoc;

        public string DK_Set_CurLoc;
        public int VW_Set_CurLoc;

        public string DK_Con_CurLoc;
        public int VW_Con_CurLoc;

        public string DK_Pre_CurLoc;
        public int VW_Pre_CurLoc;

        public string DK_Pre_BarPallet;
        public int VW_Pre_BarPallet;

        public string DK_Pre_BarProd;
        public int VW_Pre_BarProd;

        public string DK_Set_Comm;
        public string DK_Con_Comm;
        public string DK_Pre_Comm;

        public string DK_Set_Unit;
        public string DK_Con_Unit;
        public string DK_Pre_Unit;

        public string DK_Pre_Status;
        public string DK_Pre_WeiKG;


    }
}
