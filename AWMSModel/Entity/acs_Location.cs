
using AMSModel.Constant.EnumConst;

namespace AMSModel.Entity
{
    public class acs_Location : BaseEntitySTD
    {
        public long Area_ID;
        public string GroupName;
        public McLocationGroupType GroupType;
        public int McBuffer;
        public int DrawPosX;
        public int DrawPosY;
    }
}
