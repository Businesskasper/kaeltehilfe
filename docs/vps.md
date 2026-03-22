# VPS Setup

Step-by-step guide for preparing a fresh Ubuntu VPS. Run all commands as root unless noted otherwise.

## 0. SSH key

An SSH key pair is required to securely connect to the VPS. If you selected an SSH key during VPS creation (e.g. in the Hetzner Cloud Console), you already have a key — find the corresponding private key on your local machine and skip to step 1.

If you don't have an SSH key yet, create one:

**Windows (PuTTYgen):**
1. Open **PuTTYgen** and click **Generate** (move your mouse to create randomness)
2. Save the private key as `kaeltehilfe.ppk`
3. Copy the public key text from the top of the window (starts with `ssh-rsa ...`)
4. On the VPS (via Hetzner web console or password login), add the public key:
   ```bash
   mkdir -p ~/.ssh && chmod 700 ~/.ssh
   echo "ssh-rsa AAAA...your-public-key..." >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```
5. In PuTTY, set the private key under **Connection > SSH > Auth > Credentials** before connecting

**Linux/macOS:**
```bash
ssh-keygen -t ed25519 -f ~/.ssh/kaeltehilfe
ssh-copy-id -i ~/.ssh/kaeltehilfe root@<your-ip>
```

> [!NOTE]
> Hetzner lets you add SSH public keys under **Security > SSH Keys** in the Cloud Console. Keys selected during VPS creation are automatically added to the root user. The private key stays on your machine — it is never stored on the server or in the Hetzner console.

## 1. System user

Create a dedicated user and disable root login:

```bash
adduser kaeltehilfe
usermod -aG sudo kaeltehilfe

# Copy your SSH key to the new user
mkdir -p /home/kaeltehilfe/.ssh
cp ~/.ssh/authorized_keys /home/kaeltehilfe/.ssh/
chown -R kaeltehilfe:kaeltehilfe /home/kaeltehilfe/.ssh
chmod 700 /home/kaeltehilfe/.ssh
chmod 600 /home/kaeltehilfe/.ssh/authorized_keys
```

**Before continuing, verify you can SSH as the new user from a second terminal:**
```bash
ssh kaeltehilfe@<your-ip>
```

## 2. Harden SSH

```bash
sudo sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^#\?PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sudo systemctl restart ssh
```

## 3. Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

Port 81 (NGINX Proxy Manager admin) is intentionally **not** opened. Access it from your local machine via SSH tunnel when needed, then open `http://localhost:8181` in your browser.

> [!WARNING]
> Your vps provider might have an external firewall which you have to configure accordingly through your console.

**Linux/macOS:**
```bash
ssh -L 8181:127.0.0.1:81 kaeltehilfe@<your-ip>
```

**Windows (PuTTY):**
Go to **Connection > SSH > Tunnels**, set Source port to `8181`, Destination to `127.0.0.1:81`, click **Add**, then connect as usual.

## 4. Fail2ban & automatic security updates

[fail2ban](https://github.com/fail2ban/fail2ban) monitors log files for repeated failed login attempts and temporarily bans offending IPs via firewall rules.

```bash
sudo apt update && sudo apt install -y fail2ban unattended-upgrades

# Enable fail2ban for SSH
sudo tee /etc/fail2ban/jail.local > /dev/null <<'EOF'
[sshd]
enabled = true
port = ssh
maxretry = 5
bantime = 3600
findtime = 600
EOF
sudo systemctl enable --now fail2ban

# Enable automatic security updates
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 5. Install Docker

```bash
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Let kaeltehilfe run docker without sudo
sudo usermod -aG docker kaeltehilfe
```

Log out and back in for the group to take effect.
