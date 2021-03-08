using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMWUtil.Model
{
    public class TreeNode<T> : ITreeObject
    {
        public string NodeID { get; set; }
        public T Value { get; set; }
        public List<TreeNode<T>> Childs { get; set; }
        public TreeNode()
        {
            this.NodeID = ObjectUtil.GenUniqID();
            this.Childs = new List<TreeNode<T>>();
        }
        public TreeNode(T value)
        {
            this.NodeID = ObjectUtil.GenUniqID();
            this.Childs = new List<TreeNode<T>>();
            this.Value = value;
        }
        public void Add(T value)
        {
            this.Childs.Add(new TreeNode<T>(value));
        }
        public void Add(TreeNode<T> value)
        {
            this.Childs.Add(value);
        }
        public TreeNode<T> GetChildByNodeID(string NodeID)
        {
            foreach (var c in this.Childs)
            {
                if (c.NodeID == NodeID)
                {
                    return c;
                }
                else
                {
                    var res = c.GetChildByNodeID(NodeID);
                    if (res != null) return res;
                }
            }
            return null;
        }
        public List<TreeNode<T>> GetChildsByValue(T Value)
        {
            var res = new List<TreeNode<T>>();
            GetChild(Value, res);
            return res;
        }
        private void GetChild(T Value, List<TreeNode<T>> res)
        {
            foreach (var c in this.Childs)
            {
                if (c.Value.Equals(Value))
                {
                    res.Add(c);
                }
                c.GetChild(Value, res);
            }
        }

    }
}
