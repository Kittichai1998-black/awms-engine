
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
            this.lisDisplayCommand = new System.Windows.Forms.ListBox();
            this.menuMain = new System.Windows.Forms.MenuStrip();
            this.menuConfigCommand = new System.Windows.Forms.ToolStripMenuItem();
            this.lisDisplayMcLists = new System.Windows.Forms.ListBox();
            this.lisDisplayEvents = new System.Windows.Forms.ListBox();
            this.lisDisplayDevices = new System.Windows.Forms.ListBox();
            this.panel2 = new System.Windows.Forms.Panel();
            this.menuMain.SuspendLayout();
            this.panel2.SuspendLayout();
            this.SuspendLayout();
            // 
            // txtCommand
            // 
            this.txtCommand.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.txtCommand.Location = new System.Drawing.Point(0, 549);
            this.txtCommand.Margin = new System.Windows.Forms.Padding(4, 5, 4, 5);
            this.txtCommand.Name = "txtCommand";
            this.txtCommand.Size = new System.Drawing.Size(1260, 31);
            this.txtCommand.TabIndex = 0;
            this.txtCommand.KeyDown += new System.Windows.Forms.KeyEventHandler(this.txtCommand_KeyDown);
            // 
            // wkDisplay
            // 
            this.wkDisplay.DoWork += new System.ComponentModel.DoWorkEventHandler(this.wkDisplay_DoWork);
            this.wkDisplay.ProgressChanged += new System.ComponentModel.ProgressChangedEventHandler(this.wkDisplay_ProgressChanged);
            // 
            // lisDisplayCommand
            // 
            this.lisDisplayCommand.BackColor = System.Drawing.SystemColors.InfoText;
            this.lisDisplayCommand.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.lisDisplayCommand.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.lisDisplayCommand.ForeColor = System.Drawing.Color.LightBlue;
            this.lisDisplayCommand.FormattingEnabled = true;
            this.lisDisplayCommand.ItemHeight = 25;
            this.lisDisplayCommand.Location = new System.Drawing.Point(0, 389);
            this.lisDisplayCommand.Margin = new System.Windows.Forms.Padding(4, 5, 4, 5);
            this.lisDisplayCommand.Name = "lisDisplayCommand";
            this.lisDisplayCommand.Size = new System.Drawing.Size(1260, 127);
            this.lisDisplayCommand.TabIndex = 2;
            // 
            // menuMain
            // 
            this.menuMain.ImageScalingSize = new System.Drawing.Size(24, 24);
            this.menuMain.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.menuConfigCommand});
            this.menuMain.Location = new System.Drawing.Point(0, 0);
            this.menuMain.Name = "menuMain";
            this.menuMain.Size = new System.Drawing.Size(1260, 33);
            this.menuMain.TabIndex = 4;
            this.menuMain.Text = "xxxx";
            this.menuMain.ItemClicked += new System.Windows.Forms.ToolStripItemClickedEventHandler(this.menuMain_ItemClicked);
            // 
            // menuConfigCommand
            // 
            this.menuConfigCommand.Name = "menuConfigCommand";
            this.menuConfigCommand.Size = new System.Drawing.Size(170, 29);
            this.menuConfigCommand.Text = "Config Command";
            // 
            // lisDisplayMcLists
            // 
            this.lisDisplayMcLists.BackColor = System.Drawing.SystemColors.ControlText;
            this.lisDisplayMcLists.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.lisDisplayMcLists.Dock = System.Windows.Forms.DockStyle.Right;
            this.lisDisplayMcLists.ForeColor = System.Drawing.SystemColors.HighlightText;
            this.lisDisplayMcLists.FormattingEnabled = true;
            this.lisDisplayMcLists.ItemHeight = 25;
            this.lisDisplayMcLists.Location = new System.Drawing.Point(788, 0);
            this.lisDisplayMcLists.Margin = new System.Windows.Forms.Padding(4, 5, 4, 5);
            this.lisDisplayMcLists.Name = "lisDisplayMcLists";
            this.lisDisplayMcLists.Size = new System.Drawing.Size(472, 389);
            this.lisDisplayMcLists.TabIndex = 5;
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
            this.lisDisplayEvents.Size = new System.Drawing.Size(788, 389);
            this.lisDisplayEvents.TabIndex = 6;
            // 
            // lisDisplayDevices
            // 
            this.lisDisplayDevices.BackColor = System.Drawing.SystemColors.InfoText;
            this.lisDisplayDevices.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.lisDisplayDevices.Dock = System.Windows.Forms.DockStyle.Right;
            this.lisDisplayDevices.ForeColor = System.Drawing.Color.Yellow;
            this.lisDisplayDevices.FormattingEnabled = true;
            this.lisDisplayDevices.ItemHeight = 25;
            this.lisDisplayDevices.Location = new System.Drawing.Point(580, 0);
            this.lisDisplayDevices.Margin = new System.Windows.Forms.Padding(4, 5, 4, 5);
            this.lisDisplayDevices.Name = "lisDisplayDevices";
            this.lisDisplayDevices.Size = new System.Drawing.Size(208, 389);
            this.lisDisplayDevices.TabIndex = 7;
            // 
            // panel2
            // 
            this.panel2.Controls.Add(this.lisDisplayDevices);
            this.panel2.Controls.Add(this.lisDisplayEvents);
            this.panel2.Controls.Add(this.lisDisplayMcLists);
            this.panel2.Controls.Add(this.lisDisplayCommand);
            this.panel2.Dock = System.Windows.Forms.DockStyle.Fill;
            this.panel2.Location = new System.Drawing.Point(0, 33);
            this.panel2.Name = "panel2";
            this.panel2.Size = new System.Drawing.Size(1260, 516);
            this.panel2.TabIndex = 9;
            // 
            // formConsole
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(10F, 25F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.SystemColors.ActiveCaptionText;
            this.ClientSize = new System.Drawing.Size(1260, 580);
            this.Controls.Add(this.panel2);
            this.Controls.Add(this.txtCommand);
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
            this.panel2.ResumeLayout(false);
            this.ResumeLayout(false);
            this.PerformLayout();

        }
        #endregion

        private System.Windows.Forms.TextBox txtCommand;
        private System.ComponentModel.BackgroundWorker wkDisplay;
        private System.Windows.Forms.ListBox lisDisplayCommand;
        private System.Windows.Forms.MenuStrip menuMain;
        private System.Windows.Forms.ToolStripMenuItem menuConfigCommand;
        private System.Windows.Forms.ListBox lisDisplayMcLists;
        private System.Windows.Forms.ListBox lisDisplayEvents;
        private System.Windows.Forms.ListBox lisDisplayDevices;
        private System.Windows.Forms.Panel panel2;
    }
}