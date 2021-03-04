
namespace AWCSEngine
{
    partial class formConfigCommand
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.treeCMDs = new System.Windows.Forms.TreeView();
            this.groupBox1 = new System.Windows.Forms.GroupBox();
            this.btnTreeCmdActC = new System.Windows.Forms.Button();
            this.btnTreeCmdActE = new System.Windows.Forms.Button();
            this.groupBox2 = new System.Windows.Forms.GroupBox();
            this.btnTreeCmdMapC = new System.Windows.Forms.Button();
            this.btnTreeCmdMapE = new System.Windows.Forms.Button();
            this.treeCMDMaps = new System.Windows.Forms.TreeView();
            this.ddlMcMsts = new System.Windows.Forms.ComboBox();
            this.button1 = new System.Windows.Forms.Button();
            this.button2 = new System.Windows.Forms.Button();
            this.groupBox1.SuspendLayout();
            this.groupBox2.SuspendLayout();
            this.SuspendLayout();
            // 
            // treeCMDs
            // 
            this.treeCMDs.Location = new System.Drawing.Point(6, 30);
            this.treeCMDs.Name = "treeCMDs";
            this.treeCMDs.Size = new System.Drawing.Size(1127, 575);
            this.treeCMDs.TabIndex = 15;
            this.treeCMDs.KeyDown += new System.Windows.Forms.KeyEventHandler(this.treeCMDs_KeyDown);
            // 
            // groupBox1
            // 
            this.groupBox1.Controls.Add(this.btnTreeCmdActC);
            this.groupBox1.Controls.Add(this.btnTreeCmdActE);
            this.groupBox1.Controls.Add(this.treeCMDs);
            this.groupBox1.Location = new System.Drawing.Point(12, 12);
            this.groupBox1.Name = "groupBox1";
            this.groupBox1.Size = new System.Drawing.Size(1139, 611);
            this.groupBox1.TabIndex = 18;
            this.groupBox1.TabStop = false;
            this.groupBox1.Text = "Command / Actions";
            // 
            // btnTreeCmdActC
            // 
            this.btnTreeCmdActC.Location = new System.Drawing.Point(994, 571);
            this.btnTreeCmdActC.Name = "btnTreeCmdActC";
            this.btnTreeCmdActC.Size = new System.Drawing.Size(46, 34);
            this.btnTreeCmdActC.TabIndex = 22;
            this.btnTreeCmdActC.Text = "+";
            this.btnTreeCmdActC.UseVisualStyleBackColor = true;
            this.btnTreeCmdActC.Click += new System.EventHandler(this.btnTreeCmdActC_Click);
            // 
            // btnTreeCmdActE
            // 
            this.btnTreeCmdActE.Location = new System.Drawing.Point(1046, 571);
            this.btnTreeCmdActE.Name = "btnTreeCmdActE";
            this.btnTreeCmdActE.Size = new System.Drawing.Size(46, 34);
            this.btnTreeCmdActE.TabIndex = 21;
            this.btnTreeCmdActE.Text = "-";
            this.btnTreeCmdActE.UseVisualStyleBackColor = true;
            this.btnTreeCmdActE.Click += new System.EventHandler(this.btnTreeCmdActEC_Click);
            // 
            // groupBox2
            // 
            this.groupBox2.Controls.Add(this.btnTreeCmdMapC);
            this.groupBox2.Controls.Add(this.btnTreeCmdMapE);
            this.groupBox2.Controls.Add(this.treeCMDMaps);
            this.groupBox2.Controls.Add(this.ddlMcMsts);
            this.groupBox2.Location = new System.Drawing.Point(1225, 12);
            this.groupBox2.Name = "groupBox2";
            this.groupBox2.Size = new System.Drawing.Size(420, 611);
            this.groupBox2.TabIndex = 19;
            this.groupBox2.TabStop = false;
            this.groupBox2.Text = "Machine Command";
            // 
            // btnTreeCmdMapC
            // 
            this.btnTreeCmdMapC.Location = new System.Drawing.Point(274, 571);
            this.btnTreeCmdMapC.Name = "btnTreeCmdMapC";
            this.btnTreeCmdMapC.Size = new System.Drawing.Size(46, 34);
            this.btnTreeCmdMapC.TabIndex = 24;
            this.btnTreeCmdMapC.Text = "+";
            this.btnTreeCmdMapC.UseVisualStyleBackColor = true;
            // 
            // btnTreeCmdMapE
            // 
            this.btnTreeCmdMapE.Location = new System.Drawing.Point(326, 571);
            this.btnTreeCmdMapE.Name = "btnTreeCmdMapE";
            this.btnTreeCmdMapE.Size = new System.Drawing.Size(46, 34);
            this.btnTreeCmdMapE.TabIndex = 23;
            this.btnTreeCmdMapE.Text = "-";
            this.btnTreeCmdMapE.UseVisualStyleBackColor = true;
            // 
            // treeCMDMaps
            // 
            this.treeCMDMaps.Location = new System.Drawing.Point(6, 63);
            this.treeCMDMaps.Name = "treeCMDMaps";
            this.treeCMDMaps.Size = new System.Drawing.Size(408, 542);
            this.treeCMDMaps.TabIndex = 16;
            // 
            // ddlMcMsts
            // 
            this.ddlMcMsts.FormattingEnabled = true;
            this.ddlMcMsts.Location = new System.Drawing.Point(6, 24);
            this.ddlMcMsts.Name = "ddlMcMsts";
            this.ddlMcMsts.Size = new System.Drawing.Size(408, 33);
            this.ddlMcMsts.TabIndex = 17;
            this.ddlMcMsts.SelectedIndexChanged += new System.EventHandler(this.ddlMcMsts_SelectedIndexChanged);
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(1157, 275);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(62, 34);
            this.button1.TabIndex = 20;
            this.button1.Text = ">>";
            this.button1.UseVisualStyleBackColor = true;
            // 
            // button2
            // 
            this.button2.Location = new System.Drawing.Point(1157, 315);
            this.button2.Name = "button2";
            this.button2.Size = new System.Drawing.Size(62, 34);
            this.button2.TabIndex = 21;
            this.button2.Text = "<<";
            this.button2.UseVisualStyleBackColor = true;
            // 
            // formConfigCommand
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(10F, 25F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1657, 632);
            this.Controls.Add(this.button2);
            this.Controls.Add(this.button1);
            this.Controls.Add(this.groupBox2);
            this.Controls.Add(this.groupBox1);
            this.Name = "formConfigCommand";
            this.Text = "formConfigCommand";
            this.Load += new System.EventHandler(this.formConfigCommand_Load);
            this.groupBox1.ResumeLayout(false);
            this.groupBox2.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.TreeView treeCMDs;
        private System.Windows.Forms.GroupBox groupBox1;
        private System.Windows.Forms.GroupBox groupBox2;
        private System.Windows.Forms.TreeView treeCMDMaps;
        private System.Windows.Forms.ComboBox ddlMcMsts;
        private System.Windows.Forms.Button button1;
        private System.Windows.Forms.Button button2;
        private System.Windows.Forms.Button btnTreeCmdActE;
        private System.Windows.Forms.Button btnTreeCmdActC;
        private System.Windows.Forms.Button btnTreeCmdMapC;
        private System.Windows.Forms.Button btnTreeCmdMapE;
    }
}