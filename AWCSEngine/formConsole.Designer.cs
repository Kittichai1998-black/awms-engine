
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
            this.lisDisplayEngine = new System.Windows.Forms.ListBox();
            this.wkDisplay = new System.ComponentModel.BackgroundWorker();
            this.lisDisplayCommand = new System.Windows.Forms.ListBox();
            this.btnHotCmd = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // txtCommand
            // 
            this.txtCommand.Location = new System.Drawing.Point(6, 557);
            this.txtCommand.Margin = new System.Windows.Forms.Padding(4, 5, 4, 5);
            this.txtCommand.Name = "txtCommand";
            this.txtCommand.Size = new System.Drawing.Size(1565, 31);
            this.txtCommand.TabIndex = 0;
            this.txtCommand.KeyDown += new System.Windows.Forms.KeyEventHandler(this.txtCommand_KeyDown);
            // 
            // lisDisplayEngine
            // 
            this.lisDisplayEngine.BackColor = System.Drawing.SystemColors.InfoText;
            this.lisDisplayEngine.ForeColor = System.Drawing.SystemColors.Window;
            this.lisDisplayEngine.FormattingEnabled = true;
            this.lisDisplayEngine.ItemHeight = 25;
            this.lisDisplayEngine.Location = new System.Drawing.Point(6, 0);
            this.lisDisplayEngine.Margin = new System.Windows.Forms.Padding(4, 5, 4, 5);
            this.lisDisplayEngine.Name = "lisDisplayEngine";
            this.lisDisplayEngine.Size = new System.Drawing.Size(1565, 379);
            this.lisDisplayEngine.TabIndex = 1;
            // 
            // wkDisplay
            // 
            this.wkDisplay.DoWork += new System.ComponentModel.DoWorkEventHandler(this.wkDisplay_DoWork);
            this.wkDisplay.ProgressChanged += new System.ComponentModel.ProgressChangedEventHandler(this.wkDisplay_ProgressChanged);
            // 
            // lisDisplayCommand
            // 
            this.lisDisplayCommand.BackColor = System.Drawing.SystemColors.InfoText;
            this.lisDisplayCommand.ForeColor = System.Drawing.SystemColors.Window;
            this.lisDisplayCommand.FormattingEnabled = true;
            this.lisDisplayCommand.ItemHeight = 25;
            this.lisDisplayCommand.Location = new System.Drawing.Point(6, 379);
            this.lisDisplayCommand.Margin = new System.Windows.Forms.Padding(4, 5, 4, 5);
            this.lisDisplayCommand.Name = "lisDisplayCommand";
            this.lisDisplayCommand.Size = new System.Drawing.Size(1565, 179);
            this.lisDisplayCommand.TabIndex = 2;
            // 
            // btnHotCmd
            // 
            this.btnHotCmd.Location = new System.Drawing.Point(1459, 557);
            this.btnHotCmd.Name = "btnHotCmd";
            this.btnHotCmd.Size = new System.Drawing.Size(112, 34);
            this.btnHotCmd.TabIndex = 3;
            this.btnHotCmd.Text = "Hot Cmd";
            this.btnHotCmd.UseVisualStyleBackColor = true;
            this.btnHotCmd.Click += new System.EventHandler(this.btnHotCmd_Click);
            // 
            // formConsole
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(10F, 25F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1574, 594);
            this.Controls.Add(this.btnHotCmd);
            this.Controls.Add(this.lisDisplayCommand);
            this.Controls.Add(this.lisDisplayEngine);
            this.Controls.Add(this.txtCommand);
            this.Margin = new System.Windows.Forms.Padding(4, 5, 4, 5);
            this.Name = "formConsole";
            this.Text = "formAdminConsole";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.formAdminConsole_FormClosing);
            this.FormClosed += new System.Windows.Forms.FormClosedEventHandler(this.formConsole_FormClosed);
            this.Load += new System.EventHandler(this.formAdminConsole_Load);
            this.ResumeLayout(false);
            this.PerformLayout();

        }
        #endregion

        private System.Windows.Forms.TextBox txtCommand;
        private System.Windows.Forms.ListBox lisDisplayEngine;
        private System.ComponentModel.BackgroundWorker wkDisplay;
        private System.Windows.Forms.ListBox lisDisplayCommand;
        private System.Windows.Forms.Button btnHotCmd;
    }
}