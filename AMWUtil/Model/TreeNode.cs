using System;
using System.Collections.Generic;
using System.Text;

namespace AMWUtil.Model
{
    public class TreeNode<T> : ITreeObject
    {
        public T Value { get; set; }
        public List<TreeNode<T>> Childs { get; set; }
        public TreeNode()
        {
            this.Childs = new List<TreeNode<T>>();
        }
        public TreeNode(T value)
        {
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

    }
}
