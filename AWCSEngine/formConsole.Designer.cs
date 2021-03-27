
using System.Drawing;

namespace AWCSEngine
{
    partial class formConsole
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
            this.txtCommand = new System.Windows.Forms.TextBox();
            this.wkDisplay = new System.ComponentModel.BackgroundWorker();
            this.menuMain = new System.Windows.Forms.MenuStrip();
            this.menuCommand = new System.Windows.Forms.ToolStripMenuItem();
            this.menuStorage = new System.Windows.Forms.ToolStripMenuItem();
            this.lisDisplayEvents = new System.Windows.Forms.ListBox();
            this.lisDisplayCommand = new System.Windows.Forms.ListBox();
            this.lisDisplayMcLists = new System.Windows.Forms.ListBox();
            this.splitContainer1 = new System.Windows.Forms.SplitContainer();
            this.splitContainer2 = new System.Windows.Forms.SplitContainer();
            this.splitContainer3 = new System.Windows.Forms.SplitContainer();
            this.chkMcList = new System.Windows.Forms.CheckedListBox();
            this.menuMain.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer1)).BeginInit();
            this.splitContainer1.Panel1.SuspendLayout();
            this.splitContainer1.Panel2.SuspendLayout();
            this.splitContainer1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer2)).BeginInit();
            this.splitContainer2.Panel1.SuspendLayout();
            this.splitContainer2.Panel2.SuspendLayout();
            this.splitContainer2.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer3)).BeginInit();
            this.splitContainer3.Panel1.SuspendLayout();
            this.splitContainer3.Panel2.SuspendLayout();
            this.splitContainer3.SuspendLayout();
            this.SuspendLayout();
            // 
            // txtCommand
            // 
            this.txtCommand.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.txtCommand.Location = new System.Drawing.Point(0, 145);
            this.txtCommand.Margin = new System.Windows.Forms.Padding(4, 5, 4, 5);
            this.txtCommand.Name = "txtCommand";
            this.txtCommand.Size = new System.Drawing.Size(1260, 31);
            this.txtCommand.TabIndex = 0;
            this.txtCommand.TextChanged += new System.EventHandler(this.txtCommand_TextChanged);
            this.txtCommand.KeyDown += new System.Windows.Forms.KeyEventHandler(this.txtCommand_KeyDown);
            // 
            // wkDisplay
            // 
            this.wkDisplay.DoWork += new System.ComponentModel.DoWorkEventHandler(this.wkDisplay_DoWork);
            this.wkDisplay.ProgressChanged += new System.ComponentModel.ProgressChangedEventHandler(this.wkDisplay_ProgressChanged);
            // 
            // menuMain
            // 
            this.menuMain.ImageScalingSize = new System.Drawing.Size(24, 24);
            this.menuMain.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.menuCommand,
            this.menuStorage});
            this.menuMain.Location = new System.Drawing.Point(0, 0);
            this.menuMain.Name = "menuMain";
            this.menuMain.Size = new System.Drawing.Size(1260, 33);
            this.menuMain.TabIndex = 4;
            this.menuMain.Text = "xxxx";
            this.menuMain.ItemClicked += new System.Windows.Forms.ToolStripItemClickedEventHandler(this.menuMain_ItemClicked);
            // 
            // menuCommand
            // 
            this.menuCommand.Name = "menuCommand";
            this.menuCommand.Size = new System.Drawing.Size(112, 29);
            this.menuCommand.Text = "Command";
            // 
            // menuStorage
            // 
            this.menuStorage.Name = "menuStorage";
            this.menuStorage.Size = new System.Drawing.Size(89, 29);
            this.menuStorage.Text = "Storage";
            // 
            // lisDisplayEvents
            // 
            this.lisDisplayEvents.BackColor = System.Drawing.SystemColors.InfoText;
            this.lisDisplayEvents.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.lisDisplayEvents.Dock = System.Windows.Forms.DockStyle.Fill;
            this.lisDisplayEvents.ForeColor = System.Drawing.Color.LightCoral;
            this.lisDisplayEvents.FormattingEnabled = true;
            this.lisDisplayEvents.ItemHeight = 25;
            this.lisDisplayEvents.Location = new System.Drawing.Point(0, 0);
            this.lisDisplayEvents.Margin = new System.Windows.Forms.Padding(4, 5, 4, 5);
            this.lisDisplayEvents.Name = "lisDisplayEvents";
            this.lisDisplayEvents.Size = new System.Drawing.Size(606, 367);
            this.lisDisplayEvents.TabIndex = 6;
            // 
            // lisDisplayCommand
            // 
            this.lisDisplayCommand.BackColor = System.Drawing.SystemColors.InfoText;
            this.lisDisplayCommand.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.lisDisplayCommand.Dock = System.Windows.Forms.DockStyle.Fill;
            this.lisDisplayCommand.ForeColor = System.Drawing.Color.LightBlue;
            this.lisDisplayCommand.FormattingEnabled = true;
            this.lisDisplayCommand.ItemHeight = 25;
            this.lisDisplayCommand.Location = new System.Drawing.Point(0, 0);
            this.lisDisplayCommand.Margin = new System.Windows.Forms.Padding(4, 5, 4, 5);
            this.lisDisplayCommand.Name = "lisDisplayCommand";
            this.lisDisplayCommand.Size = new System.Drawing.Size(1260, 176);
            this.lisDisplayCommand.TabIndex = 2;
            this.lisDisplayCommand.Click += new System.EventHandler(this.lisDisplayCommand_Click_1);
            this.lisDisplayCommand.SelectedIndexChanged += new System.EventHandler(this.lisDisplayCommand_SelectedIndexChanged);
            // 
            // lisDisplayMcLists
            // 
            this.lisDisplayMcLists.BackColor = System.Drawing.SystemColors.ControlText;
            this.lisDisplayMcLists.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.lisDisplayMcLists.Dock = System.Windows.Forms.DockStyle.Fill;
            this.lisDisplayMcLists.ForeColor = System.Drawing.SystemColors.HighlightText;
            this.lisDisplayMcLists.FormattingEnabled = true;
            this.lisDisplayMcLists.ItemHeight = 25;
            this.lisDisplayMcLists.Location = new System.Drawing.Point(0, 0);
            this.lisDisplayMcLists.Margin = new System.Windows.Forms.Padding(4, 5, 4, 5);
            this.lisDisplayMcLists.Name = "lisDisplayMcLists";
            this.lisDisplayMcLists.Size = new System.Drawing.Size(496, 367);
            this.lisDisplayMcLists.TabIndex = 5;
            this.lisDisplayMcLists.SelectedIndexChanged += new System.EventHandler(this.lisDisplayMcLists_SelectedIndexChanged);
            // 
            // splitContainer1
            // 
            this.splitContainer1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.splitContainer1.FixedPanel = System.Windows.Forms.FixedPanel.Panel2;
            this.splitContainer1.IsSplitterFixed = true;
            this.splitContainer1.Location = new System.Drawing.Point(0, 33);
            this.splitContainer1.Name = "splitContainer1";
            this.splitContainer1.Orientation = System.Windows.Forms.Orientation.Horizontal;
            // 
            // splitContainer1.Panel1
            // 
            this.splitContainer1.Panel1.Controls.Add(this.splitContainer2);
            // 
            // splitContainer1.Panel2
            // 
            this.splitContainer1.Panel2.Controls.Add(this.txtCommand);
            this.splitContainer1.Panel2.Controls.Add(this.lisDisplayCommand);
            this.splitContainer1.Size = new System.Drawing.Size(1260, 547);
            this.splitContainer1.SplitterDistance = 367;
            this.splitContainer1.TabIndex = 7;
            // 
            // splitContainer2
            // 
            this.splitContainer2.Dock = System.Windows.Forms.DockStyle.Fill;
            this.splitContainer2.Location = new System.Drawing.Point(0, 0);
            this.splitContainer2.Name = "splitContainer2";
            // 
            // splitContainer2.Panel1
            // 
            this.splitContainer2.Panel1.Controls.Add(this.splitContainer3);
            // 
            // splitContainer2.Panel2
            // 
            this.splitContainer2.Panel2.Controls.Add(this.lisDisplayEvents);
            this.splitContainer2.Size = new System.Drawing.Size(1260, 367);
            this.splitContainer2.SplitterDistance = 650;
            this.splitContainer2.TabIndex = 7;
            // 
            // splitContainer3
            // 
            this.splitContainer3.Dock = System.Windows.Forms.DockStyle.Fill;
            this.splitContainer3.FixedPanel = System.Windows.Forms.FixedPanel.Panel1;
            this.splitContainer3.IsSplitterFixed = true;
            this.splitContainer3.Location = new System.Drawing.Point(0, 0);
            this.splitContainer3.Name = "splitContainer3";
            // 
            // splitContainer3.Panel1
            // 
            this.splitContainer3.Panel1.Controls.Add(this.chkMcList);
            // 
            // splitContainer3.Panel2
            // 
            this.splitContainer3.Panel2.Controls.Add(this.lisDisplayMcLists);
            this.splitContainer3.Size = new System.Drawing.Size(650, 367);
            this.splitContainer3.SplitterDistance = 150;
            this.splitContainer3.TabIndex = 8;
            // 
            // chkMcList
            // 
            this.chkMcList.BackColor = System.Drawing.Color.Black;
            this.chkMcList.CheckOnClick = true;
            this.chkMcList.Dock = System.Windows.Forms.DockStyle.Fill;
            this.chkMcList.ForeColor = System.Drawing.Color.Yellow;
            this.chkMcList.FormattingEnabled = true;
            this.chkMcList.Location = new System.Drawing.Point(0, 0);
            this.chkMcList.Name = "chkMcList";
            this.chkMcList.Size = new System.Drawing.Size(150, 367);
            this.chkMcList.TabIndex = 7;
            // 
            // formConsole
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(10F, 25F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.SystemColors.ActiveCaptionText;
            this.ClientSize = new System.Drawing.Size(1260, 580);
            this.Controls.Add(this.splitContainer1);
            this.Controls.Add(this.menuMain);
            this.MainMenuStrip = this.menuMain;
            this.Margin = new System.Windows.Forms.Padding(4, 5, 4, 5);
            this.Name = "formConsole";
            this.Text = "formAdminConsole";
            this.WindowState = System.Windows.Forms.FormWindowState.Maximized;
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.formAdminConsole_FormClosing);
            this.FormClosed += new System.Windows.Forms.FormClosedEventHandler(this.formConsole_FormClosed);
            this.Load += new System.EventHandler(this.formAdminConsole_Load);
            this.menuMain.ResumeLayout(false);
            this.menuMain.PerformLayout();
            this.splitContainer1.Panel1.ResumeLayout(false);
            this.splitContainer1.Panel2.ResumeLayout(false);
            this.splitContainer1.Panel2.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer1)).EndInit();
            this.splitContainer1.ResumeLayout(false);
            this.splitContainer2.Panel1.ResumeLayout(false);
            this.splitContainer2.Panel2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer2)).EndInit();
            this.splitContainer2.ResumeLayout(false);
            this.splitContainer3.Panel1.ResumeLayout(false);
            this.splitContainer3.Panel2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer3)).EndInit();
            this.splitContainer3.ResumeLayout(false);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TextBox txtCommand;
        private System.ComponentModel.BackgroundWorker wkDisplay;
        private System.Windows.Forms.MenuStrip menuMain;
        private System.Windows.Forms.ToolStripMenuItem menuConfigCommand;
        private System.Windows.Forms.ToolStripMenuItem menuCommand;
        private System.Windows.Forms.ToolStripMenuItem menuStorage;
        private System.Windows.Forms.ListBox lisDisplayEvents;
        private System.Windows.Forms.ListBox lisDisplayCommand;
        private System.Windows.Forms.ListBox lisDisplayMcLists;
        private System.Windows.Forms.SplitContainer splitContainer1;
        private System.Windows.Forms.SplitContainer splitContainer2;
        private System.Windows.Forms.SplitContainer splitContainer3;
        private System.Windows.Forms.CheckedListBox chkMcList;
    }
}