
using AMSModel.Constant.EnumConst;

namespace AMSModel.Entity
{
    public class acs_Location : BaseEntitySTD
    {
        public int Area_ID;
        public string GroupCode;
        public LocationGroupType GroupType;
        public int McBuffer;
        public int DrawPosX;
        public int DrawPosY;
    }
}
