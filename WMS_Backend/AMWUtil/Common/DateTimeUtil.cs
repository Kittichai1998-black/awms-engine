using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AMWUtil.Common
{
    public static class DateTimeUtil
    {
        public const string DATETIME_FORMAT = "s";
        public const string DATE_FORMAT = "yyyy-MM-dd";
        static GregorianCalendar _gc = new GregorianCalendar();
        public static string ToISOString(this DateTime dt)
        {
            return dt.ToString(DATETIME_FORMAT);
        }
        public static string ToISOString(this DateTime? dtUTC)
        {
            if (dtUTC.HasValue)
            {
                return dtUTC.Value.ToString(DATETIME_FORMAT);
            }
            return null;
        }
        public static string ToISOUTCString(this DateTime? dtUTC)
        {
            if (dtUTC.HasValue)
            {
                return dtUTC.Value.ToString(DATE_FORMAT);
            }
            return null;
        }
        public static string ToISODateString(this DateTime d)
        {
            return d.ToUniversalTime().ToString(DATE_FORMAT);
        }
        public static string ToISODateString(this DateTime? d)
        {
            if (d.HasValue)
            {
                return d.Value.ToUniversalTime().ToString(DATE_FORMAT);
            }
            return null;
        }
        
        public static int GetWeekOfMonth(this DateTime time)
        {
            DateTime first = new DateTime(time.Year, time.Month, 1);
            return time.GetWeekOfYear() - first.GetWeekOfYear() + 1;
        }

        static int GetWeekOfYear(this DateTime time)
        {
            return _gc.GetWeekOfYear(time, CalendarWeekRule.FirstDay, DayOfWeek.Monday);
        }

        public static DateTime? GetDateTime(this string dtISO)
        {
            try
            {
                return DateTime.Parse(dtISO, null, System.Globalization.DateTimeStyles.RoundtripKind);
                //return DateTime.ParseExact(dt, DATETIME_FORMAT, CultureInfo.InvariantCulture);
            }
            catch
            {
                return null;
            }
        }

        public static DateTime? GetDate(this string dISO)
        {
            try
            {
                return DateTime.Parse(dISO, null, System.Globalization.DateTimeStyles.RoundtripKind);
                //return DateTime.ParseExact(dISO, DATE_FORMAT, CultureInfo.InvariantCulture);
            }
            catch
            {
                return null;
            }        
        }
    }
    
}
