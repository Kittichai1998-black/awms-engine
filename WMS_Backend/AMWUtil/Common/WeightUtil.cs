using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace AMWUtil.Common
{
    public static class WeightUtil
    {
        public enum WeightType
        {
            [AMWUtil.Common.EnumValue(ValueDouble = 1d)]
            KG,//1/1
            [AMWUtil.Common.EnumValue(ValueDouble = 1000d)]
            G,//1/1000
            [AMWUtil.Common.EnumValue(ValueDouble = 1d / 1000000d)]
            KT,//1000000/1
            [AMWUtil.Common.EnumValue(ValueDouble = 1000000d / 453592d)]
            LB,//453592/1000000
            [AMWUtil.Common.EnumValue(ValueDouble = 1000000d / 1d)]
            MG,//1/1000000
            [AMWUtil.Common.EnumValue(ValueDouble = 2000000d / 56699d)]
            OZ,//56699/2000000
            [AMWUtil.Common.EnumValue(ValueDouble = 1d / 1000d)]
            TO,//1000/1
            [AMWUtil.Common.EnumValue(ValueDouble = 1d / 1000d)]
            TON//1000/1
        }

        public static decimal ConvertToKG(decimal wei, WeightType unit)
        {
            return wei / (decimal)unit.Attribute<EnumValueAttribute>().ValueDouble;
        }
        public static decimal ConvertToKG(decimal wei, string unit)
        {
            string u = Regex.Replace(unit, "[.]", "");

            WeightType wt = EnumUtil.GetValueEnum<WeightType>(u.ToUpper());
            return wei / (decimal)wt.Attribute<EnumValueAttribute>().ValueDouble;
        }
    }
}
