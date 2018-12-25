using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AMWUtil.Exception
{
    public enum AMWExceptionCode
    {
        /*********SUCCESS***********/
        [AMWExceptionDescription(TH = "สำเร็จ" , EN = "Success")]
        I0000,
        [AMWExceptionDescription(TH = "ไม่สำเร็จ", EN = "Fail")]
        I0001,

        /******VALIDATE*******/
        /// <summary>Data Input Not Found : {0}</summary>
        [AMWExceptionDescription(TH = "{0}", EN = "Data Input Not Found : {0}")]
        V1001,
        /// <summary>Invalid Data Input : {0}</summary>
        [AMWExceptionDescription(TH = "{0}", EN = "Invalid Data Input : {0}")]
        V1002,

        /// <summary>Data System Not Found : {0}</summary>
        [AMWExceptionDescription(TH = "{0}", EN = "Data System Not Found : {0}")]
        V2001,
        /// <summary>Invalid Data System : {0}</summary>
        [AMWExceptionDescription(TH = "{0}", EN = "Invalid Data System : {0}")]
        V2002,

        /// <summary>Data Output Not Found : {0}</summary>
        [AMWExceptionDescription(TH = "{0}", EN = "Data Output Not Found : {0}")]
        V3001,
        /// <summary>Invalid Data Output : {0}</summary>
        [AMWExceptionDescription(TH = "{0}", EN = "Invalid Data Ouput : {0}")]
        V3002,

        /// <summary>Condition Error : {0}</summary>
        [AMWExceptionDescription(TH = "{0}", EN = "Condition Error : {0}")]
        B0001,
        /// <summary>{0} Not enough</summary>
        [AMWExceptionDescription(TH = "{0}", EN = "{0} Not Enough")]
        B0002,

        /// <summary>System Error : {0}</summary>
        [AMWExceptionDescription(TH = "{0}", EN = "{0} in System Below")]
        S0001,
        /// <summary>Connection Error : {0}</summary>
        [AMWExceptionDescription(TH = "{0}", EN = "Connection Error : {0}")]
        S0002,
        /// <summary>Time Out : {0}</summary>
        [AMWExceptionDescription(TH = "{0}", EN = "Time Out : {0}")]
        S0003,

        
        /// <summary>Authentication Error</summary>
        [AMWExceptionDescription(TH = "Authentication Error : {0}", EN = "Authentication Error : {0}")]
        A0001,
        /// <summary>Authorization Error</summary>
        [AMWExceptionDescription(TH = "Authorization Error", EN = "Authorization Error")]
        A0002,
        /// <summary>Token Error : {0}</summary>
        [AMWExceptionDescription(TH = "{0}", EN = "Token Error : {0}")]
        A0003,


        [AMWExceptionDescription(TH = "UKNOW : {0}", EN = "UKNOW : {0}", CN = "UKNOW : {0}")]
        U0000,
    }
}
