
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
            this.ddlCmdTypes = new System.Windows.Forms.ComboBox();
            this.label1 = new System.Windows.Forms.Label();
            this.groupBox1 = new System.Windows.Forms.GroupBox();
            this.groupBox2 = new System.Windows.Forms.GroupBox();
            this.label2 = new System.Windows.Forms.Label();
            this.ddlMcMsts = new System.Windows.Forms.ComboBox();
            this.treeCMDMaps = new System.Windows.Forms.TreeView();
            this.button1 = new System.Windows.Forms.Button();
            this.button2 = new System.Windows.Forms.Button();
            this.groupBox1.SuspendLayout();
            this.groupBox2.SuspendLayout();
            this.SuspendLayout();
            // 
            // treeCMDs
            // 
            this.treeCMDs.Location = new System.Drawing.Point(6, 63);
            this.treeCMDs.Name = "treeCMDs";
            this.treeCMDs.Size = new System.Drawing.Size(535, 542);
            this.treeCMDs.TabIndex = 15;
            // 
            // ddlCmdTypes
            // 
            this.ddlCmdTypes.FormattingEnabled = true;
            this.ddlCmdTypes.Location = new System.Drawing.Point(61, 24);
            this.ddlCmdTypes.Name = "ddlCmdTypes";
            this.ddlCmdTypes.Size = new System.Drawing.Size(480, 33);
            this.ddlCmdTypes.TabIndex = 1;
            this.ddlCmdTypes.SelectedIndexChanged += new System.EventHandler(this.ddlCmdTypes_SelectedIndexChanged);
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(6, 27);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(49, 25);
            this.label1.TabIndex = 0;
            this.label1.Text = "Type";
            // 
            // groupBox1
            // 
            this.groupBox1.Controls.Add(this.label1);
            this.groupBox1.Controls.Add(this.ddlCmdTypes);
            this.groupBox1.Controls.Add(this.treeCMDs);
            this.groupBox1.Location = new System.Drawing.Point(12, 12);
            this.groupBox1.Name = "groupBox1";
            this.groupBox1.Size = new System.Drawing.Size(547, 611);
            this.groupBox1.TabIndex = 18;
            this.groupBox1.TabStop = false;
            this.groupBox1.Text = "Command Actions";
            // 
            // groupBox2
            // 
            this.groupBox2.Controls.Add(this.treeCMDMaps);
            this.groupBox2.Controls.Add(this.label2);
            this.groupBox2.Controls.Add(this.ddlMcMsts);
            this.groupBox2.Location = new System.Drawing.Point(633, 12);
            this.groupBox2.Name = "groupBox2";
            this.groupBox2.Size = new System.Drawing.Size(547, 611);
            this.groupBox2.TabIndex = 19;
            this.groupBox2.TabStop = false;
            this.groupBox2.Text = "Command Mappings";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(14, 27);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(36, 25);
            this.label2.TabIndex = 16;
            this.label2.Text = "Mc";
            // 
            // ddlMcMsts
            // 
            this.ddlMcMsts.FormattingEnabled = true;
            this.ddlMcMsts.Location = new System.Drawing.Point(56, 24);
            this.ddlMcMsts.Name = "ddlMcMsts";
            this.ddlMcMsts.Size = new System.Drawing.Size(480, 33);
            this.ddlMcMsts.TabIndex = 17;
            this.ddlMcMsts.SelectedIndexChanged += new System.EventHandler(this.ddlMcMsts_SelectedIndexChanged);
            // 
            // treeCMDMaps
            // 
            this.treeCMDMaps.Location = new System.Drawing.Point(6, 63);
            this.treeCMDMaps.Name = "treeCMDMaps";
            this.treeCMDMaps.Size = new System.Drawing.Size(535, 542);
            this.treeCMDMaps.TabIndex = 16;
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(565, 297);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(62, 34);
            this.button1.TabIndex = 20;
            this.button1.Text = ">>";
            this.button1.UseVisualStyleBackColor = true;
            // 
            // button2
            // 
            this.button2.Location = new System.Drawing.Point(565, 337);
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
            this.ClientSize = new System.Drawing.Size(1198, 632);
            this.Controls.Add(this.button2);
            this.Controls.Add(this.button1);
            this.Controls.Add(this.groupBox2);
            this.Controls.Add(this.groupBox1);
            this.Name = "formConfigCommand";
            this.Text = "formConfigCommand";
            this.Load += new System.EventHandler(this.formConfigCommand_Load);
            this.groupBox1.ResumeLayout(false);
            this.groupBox1.PerformLayout();
            this.groupBox2.ResumeLayout(false);
            this.groupBox2.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.TreeView treeCMDs;
        private System.Windows.Forms.ComboBox ddlCmdTypes;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.GroupBox groupBox1;
        private System.Windows.Forms.GroupBox groupBox2;
        private System.Windows.Forms.TreeView treeCMDMaps;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.ComboBox ddlMcMsts;
        private System.Windows.Forms.Button button1;
        private System.Windows.Forms.Button button2;
    }
}