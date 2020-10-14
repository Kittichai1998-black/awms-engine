using System.ComponentModel.DataAnnotations;

namespace AWCSModel.Entity
{
    public abstract class BaseEntitySTD : BaseEntityCreateModify
    {
        [Display(Name = "รหัสพื้นที่", Order = 1)]
        public string Code;
        [Display(Name = "ชื่อพื้นที่", Order = 2)]
        public string Name;
        [Display(Name = "รายละเอียด", Order = 3)]
        public string Description;
    }
}
