
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
            this.SuspendLayout();
            // 
            // txtCommand
            // 
            this.txtCommand.Location = new System.Drawing.Point(744, 559);
            this.txtCommand.Name = "txtCommand";
            this.txtCommand.Size = new System.Drawing.Size(357, 23);
            this.txtCommand.TabIndex = 0;
            this.txtCommand.KeyDown += new System.Windows.Forms.KeyEventHandler(this.txtCommand_KeyDown);
            // 
            // lisDisplayEngine
            // 
            this.lisDisplayEngine.FormattingEnabled = true;
            this.lisDisplayEngine.ItemHeight = 15;
            this.lisDisplayEngine.Location = new System.Drawing.Point(4, 0);
            this.lisDisplayEngine.Name = "lisDisplayEngine";
            this.lisDisplayEngine.Size = new System.Drawing.Size(737, 589);
            this.lisDisplayEngine.TabIndex = 1;
            // 
            // wkDisplay
            // 
            this.wkDisplay.DoWork += new System.ComponentModel.DoWorkEventHandler(this.wkDisplay_DoWork);
            this.wkDisplay.ProgressChanged += new System.ComponentModel.ProgressChangedEventHandler(this.wkDisplay_ProgressChanged);
            // 
            // lisDisplayCommand
            // 
            this.lisDisplayCommand.FormattingEnabled = true;
            this.lisDisplayCommand.ItemHeight = 15;
            this.lisDisplayCommand.Location = new System.Drawing.Point(744, 0);
            this.lisDisplayCommand.Name = "lisDisplayCommand";
            this.lisDisplayCommand.Size = new System.Drawing.Size(357, 559);
            this.lisDisplayCommand.TabIndex = 2;
            // 
            // formConsole
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1102, 583);
            this.Controls.Add(this.lisDisplayCommand);
            this.Controls.Add(this.lisDisplayEngine);
            this.Controls.Add(this.txtCommand);
            this.Name = "formConsole";
            this.Text = "formAdminConsole";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.formAdminConsole_FormClosing);
            this.Load += new System.EventHandler(this.formAdminConsole_Load);
            this.ResumeLayout(false);
            this.PerformLayout();

        }
        #endregion

        private System.Windows.Forms.TextBox txtCommand;
        private System.Windows.Forms.ListBox lisDisplayEngine;
        private System.ComponentModel.BackgroundWorker wkDisplay;
        private System.Windows.Forms.ListBox lisDisplayCommand;
    }
}