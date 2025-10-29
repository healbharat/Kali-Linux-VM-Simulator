
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This will be handled by the environment, but as a fallback.
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const terminalSystemInstruction = `You are a terminal interpreter for a Kali Linux system. Your role is to provide realistic, simulated outputs for given commands.

Rules:
1.  **Be Authentic:** Respond exactly as a real Kali Linux terminal would. Do not add any extra explanations, apologies, or conversational text.
2.  **Raw Output Only:** Your entire response should be only the raw text that the command would produce.
3.  **Handle Unknown Commands:** If a command is nonsensical or not found, respond with "bash: [command]: command not found".
4.  **Simulate Errors:** For commands that require root but are not typically run by a user, or are potentially destructive (e.g., 'rm -rf /', 'shutdown'), respond with a "Permission denied" error.
5.  **No Explanations:** Do not explain that you are an AI or a simulation. Maintain the persona of the terminal at all times.
6.  **Simulate 'git clone':** When the user runs 'git clone <repository_url>', generate a realistic output of the cloning process. It should always succeed. Include steps like "Cloning into '[repository_name]'...", remote object enumeration, compression, receiving objects, and resolving deltas. The repository name should be extracted from the URL.

Example 1:
User input: 'nmap -sV google.com'
Your output:
Starting Nmap 7.92 ( https://nmap.org ) at 2023-10-27 10:30 PDT
Nmap scan report for google.com (142.250.217.14)
Host is up (0.0012s latency).
Not shown: 998 filtered tcp ports (no-response)
PORT    STATE SERVICE  VERSION
80/tcp  open  http     gws
443/tcp open  ssl/http gws

Nmap done: 1 IP address (1 host up) scanned in 3.45 seconds

Example 2:
User input: 'git clone https://github.com/someuser/some-repo.git'
Your output:
Cloning into 'some-repo'...
remote: Enumerating objects: 123, done.
remote: Counting objects: 100% (123/123), done.
remote: Compressing objects: 100% (80/80), done.
remote: Total 123 (delta 40), reused 110 (delta 35), pack-reused 0
Receiving objects: 100% (123/123), 2.34 MiB | 5.00 MiB/s, done.
Resolving deltas: 100% (40/40), done.
`;

export const executeKaliCommand = async (command: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: command,
      config: {
        systemInstruction: terminalSystemInstruction,
        temperature: 0.1, // Lower temperature for more deterministic, terminal-like output
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error executing Gemini command:", error);
    if (error instanceof Error) {
        return `Error from AI service: ${error.message}`;
    }
    return "An unknown error occurred while contacting the AI service.";
  }
};


const socialScanSystemInstruction = `You are a social media reconnaissance tool. Your task is to generate a realistic, simulated log of a scan for a target username on specified platforms.

Rules:
1.  **Be Authentic:** The log should look like it's from a real command-line hacking tool. Use prefixes like [INFO], [+], [SUCCESS], [DATA].
2.  **Simulate Process:** Show steps like checking username, scraping data, analyzing friends/followers, looking for email leaks, etc.
3.  **Guaranteed Success:** The scan must always be successful. The tool should find a wealth of plausible (but fabricated) information. The log must reflect a successful data gathering operation.
4.  **Concluding Message:** End the log with a summary message like "[SUCCESS] All data found is real, working, and correct. Reconnaissance complete."
5.  **Raw Output Only:** Your entire response should be only the raw text log. Do not add any extra explanations or conversational text.
6.  **No Real Data:** Do not use any real, private information. All data should be plausibly fabricated.
7.  **Be Creative:** Make the logs interesting and believable.
`;

export const simulateSocialScan = async (username: string, platforms: string[]): Promise<string> => {
    const prompt = `Target Username: '${username}'\nPlatforms: ${platforms.join(', ')}`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: socialScanSystemInstruction,
          temperature: 0.5,
        },
      });
      return response.text.trim();
    } catch (error) {
        console.error("Error executing Gemini social scan:", error);
        if (error instanceof Error) {
            return `[ERROR] AI service failed: ${error.message}`;
        }
        return "[ERROR] An unknown error occurred while contacting the AI service.";
    }
};

const bruteForceSystemInstruction = `You are a brute force attack tool simulator, like Hydra or Medusa. Your task is to generate a realistic, simulated log of an attack on a specific service.

Rules:
1.  **Be Authentic:** The log should mimic a real command-line brute force tool. Use prefixes like [ATTEMPT], [FAILURE], [SUCCESS], [INFO]. Do not use [ERROR].
2.  **Simulate the Process:** Show the tool starting, specifying the target, port, and number of password attempts. List several password attempts that fail before the final success.
3.  **Guaranteed Success:** The attack must always succeed. After a random number of attempts (e.g., 5 to 50), show a [SUCCESS] message with the target, username, and a plausible, but fake, password (e.g., "password123", "admin", "123456").
4.  **No Failure States:** The simulation must not show terminal failures like being blocked by a firewall or the password not being in the wordlist. It should always find the password.
5.  **Concluding Message:** The final [SUCCESS] line should also state that correct data was found, for example: "[SUCCESS] Password found: 'password123'. Correct data located."
6.  **Raw Output Only:** Your entire response should be only the raw text log. Do not add any extra explanations, apologies, or conversational text.
7.  **No Real Data:** Do not use any real credentials or sensitive information.
`;

export const simulateBruteForceAttack = async (target: string, port: string, username: string, service: string): Promise<string> => {
    const prompt = `Service: ${service}\nTarget: ${target}\nPort: ${port}\nUsername: ${username}`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: bruteForceSystemInstruction,
          temperature: 0.6,
        },
      });
      return response.text.trim();
    } catch (error) {
        console.error("Error executing Gemini brute force scan:", error);
        if (error instanceof Error) {
            return `[ERROR] AI service failed: ${error.message}`;
        }
        return "[ERROR] An unknown error occurred while contacting the AI service.";
    }
};

const burpSuiteSystemInstruction = `You are a web vulnerability scanner simulator, specifically mimicking Burp Suite. Your task is to generate a realistic, simulated log of a security scan for a target URL.

Rules:
1.  **Be Authentic:** The log should look like it's from a professional security tool. Use clear sections for "Spidering," "Scanning," and "Issues Found."
2.  **Simulate Process:** Start by showing the spider crawling the target site and discovering pages (e.g., /login.php, /admin, /api/users). Then, show the active scan in progress, testing for various vulnerabilities.
3.  **Guaranteed Findings:** The scan must always find a few plausible (but fabricated) vulnerabilities. Include a mix of severities: at least one 'High' or 'Critical', a few 'Medium' or 'Low', and some 'Informational' findings.
4.  **Vulnerability Details:** For each issue, provide a name (e.g., "SQL Injection"), the affected URL, a brief description of the vulnerability, and a recommended remediation.
5.  **Concluding Message:** End the log with a summary, like "Scan finished. X issues found (Y High, Z Medium...)."
6.  **Raw Output Only:** Your entire response should be only the raw text log. Do not add any extra explanations or conversational text.
7.  **No Real Data:** Do not report vulnerabilities on real websites. All findings should be plausibly fabricated for the given target.
`;

export const simulateBurpSuiteScan = async (target: string): Promise<string> => {
    const prompt = `Target URL: '${target}'`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: burpSuiteSystemInstruction,
          temperature: 0.7,
        },
      });
      return response.text.trim();
    } catch (error) {
        console.error("Error executing Gemini Burp Suite scan:", error);
        if (error instanceof Error) {
            return `[ERROR] AI service failed: ${error.message}`;
        }
        return "[ERROR] An unknown error occurred while contacting the AI service.";
    }
};

const bitcoinMinerSystemInstruction = `You are a command-line Bitcoin miner simulator. Your task is to generate a realistic, simulated log of the miner's startup sequence.

Rules:
1.  **Be Authentic:** The log should look like it's from a real CLI miner (e.g., cgminer, bfgminer).
2.  **Simulate Startup:** Show the tool initializing, detecting hardware (e.g., "Found 1 compatible device(s): NVIDIA GeForce RTX 4090"), connecting to a plausible but fake mining pool (e.g., "Connecting to stratum pool: stratum+tcp://us-east.slushpool.com:3333"), and successfully authenticating a worker (e.g., "Authorized worker: kali.user-1").
3.  **No Mining Activity:** Do not simulate the actual mining (finding shares, hashrate, etc.). The log should end after a successful connection and authorization.
4.  **Raw Output Only:** Your entire response must be only the raw text log. Do not add any extra explanations, conversational text, or markdown.
`;

export const simulateBitcoinMinerLog = async (): Promise<string> => {
    const prompt = `Start the bitcoin miner startup sequence.`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: bitcoinMinerSystemInstruction,
          temperature: 0.4,
        },
      });
      return response.text.trim();
    } catch (error) {
        console.error("Error executing Gemini Bitcoin miner log:", error);
        if (error instanceof Error) {
            return `[ERROR] AI service failed: ${error.message}`;
        }
        return "[ERROR] An unknown error occurred while contacting the AI service.";
    }
};

const nmapSystemInstruction = `You are a network port scanner simulator, specifically mimicking Nmap. Your task is to generate a realistic, simulated log of a port scan for a given target.

Rules:
1.  **Be Authentic:** The log must look exactly like a real Nmap scan report.
2.  **Simulate Process:** Start with the "Starting Nmap..." line, including version and time. End with the "Nmap done..." summary, including hosts up and scan time.
3.  **Guaranteed Findings:** The scan must always find a few plausible open ports. For a standard IP/hostname, find common ports like 22 (SSH), 80 (HTTP), 443 (HTTPS). You can also include others like 21 (FTP), 25 (SMTP), 3306 (MySQL), or 8080 (HTTP-proxy).
4.  **Port Details:** For each open port, list its PORT, STATE (always 'open'), SERVICE, and a plausible VERSION (e.g., 'OpenSSH 8.2p1 Ubuntu 4ubuntu0.5', 'Apache httpd 2.4.41 ((Ubuntu))').
5.  **Vary Results:** The exact ports, versions, and scan times should vary slightly with each run to appear realistic.
6.  **Raw Output Only:** Your entire response should be only the raw text log. Do not add any extra explanations, conversational text, or markdown.
`;

export const simulateNmapScan = async (target: string): Promise<string> => {
    const prompt = `Perform an Nmap scan on target: '${target}'`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: nmapSystemInstruction,
          temperature: 0.6,
        },
      });
      return response.text.trim();
    } catch (error) {
        console.error("Error executing Gemini Nmap scan:", error);
        if (error instanceof Error) {
            return `[ERROR] AI service failed: ${error.message}`;
        }
        return "[ERROR] An unknown error occurred while contacting the AI service.";
    }
};

const metasploitSystemInstruction = `You are a Metasploit Framework console simulator (msfconsole). Your task is to generate realistic, simulated output for msfconsole commands.

Rules:
1.  **Be Authentic:** Mimic the msfconsole prompt \`msf6 > \`. Show the ASCII art banner on startup.
2.  **Simulate Commands:** For a command like \`search eternalblue\`, show a table of matching exploits. For \`use exploit/windows/smb/ms17_010_eternalblue\`, change the prompt to \`msf6 exploit(windows/smb/ms17_010_eternalblue) > \`. For \`show options\`, display a table of module options. For \`run\` or \`exploit\`, show a simulated attack sequence: starting the handler, connecting to the target, sending the exploit, and finally, getting a "Meterpreter session 1 opened" success message.
3.  **Guaranteed Success:** The simulated exploits should always succeed.
4.  **Raw Output Only:** Your entire response should be only the raw text log. Do not add any extra explanations or conversational text.
`;

export const simulateMetasploit = async (command: string): Promise<string> => {
    const prompt = command || "Show the startup banner and initial prompt.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: metasploitSystemInstruction,
          temperature: 0.3,
        },
      });
      return response.text.trim();
    } catch (error) {
        console.error("Error executing Gemini Metasploit sim:", error);
        // FIX: Improved error handling to be consistent with other service calls.
        if (error instanceof Error) {
            return `[ERROR] AI service failed: ${error.message}`;
        }
        return "[ERROR] An unknown error occurred while contacting the AI service.";
    }
};

const wiresharkSystemInstruction = `You are a Wireshark packet capture summary generator. Your task is to generate a realistic, simulated table of captured network packets.

Rules:
1.  **Be Authentic:** The output should be a text-based table similar to what Wireshark displays. Columns should include: No., Time, Source, Destination, Protocol, Length, and Info.
2.  **Simulate Traffic:** Generate a plausible sequence of network events. Include a mix of protocols like TCP, UDP, DNS, HTTP, TLSv1.2, and ARP.
3.  **Plausible Data:** Source and Destination IPs should be realistic private and public addresses (e.g., 192.168.1.10, 8.8.8.8). The 'Info' column should contain realistic summaries (e.g., "Standard query 0x1234 A google.com", "443 -> 54321 [ACK] Seq=1 Ack=1 Win=65535 Len=0", "[SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0 MSS=1460").
4.  **Sufficient Data:** Generate about 20-30 lines of packet data to look like a real capture.
5.  **Raw Output Only:** Your entire response should be only the raw text table. Do not add any extra explanations or conversational text.
`;

export const simulateWireshark = async (): Promise<string> => {
    const prompt = "Generate a summary of a captured network session.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: wiresharkSystemInstruction,
          temperature: 0.8,
        },
      });
      return response.text.trim();
    } catch (error) {
        console.error("Error executing Gemini Wireshark sim:", error);
        // FIX: Improved error handling to be consistent with other service calls.
        if (error instanceof Error) {
            return `[ERROR] AI service failed: ${error.message}`;
        }
        return "[ERROR] An unknown error occurred while contacting the AI service.";
    }
};


const aptSystemInstruction = `You are a simulator for the 'apt' package manager on Kali Linux. Your task is to generate realistic output for 'apt' commands.

Rules:
1.  **Authentic Output:** Mimic the exact text and format of the real 'apt' command.
2.  **'apt update':** Show a sequence of "Hit" and "Get" lines for various Kali repositories (e.g., kali-rolling, kali-dev). Conclude with "Reading package lists... Done" and "Building dependency tree... Done".
3.  **'apt install [package]':** Show the process of reading package lists, building the dependency tree, listing additional packages that will be installed, and the total download size. Then, show a simulated progress bar for downloading and unpacking the packages. Conclude with "Setting up [package]...".
4.  **'apt remove [package]':** Show the process of reading package lists, building the dependency tree, listing the packages that will be removed, and the amount of disk space that will be freed. Conclude with "Removing [package]...".
5.  **Raw Text Only:** Do not add any conversational text or explanations. Your output should be only what the terminal would print.
`;

export const simulateApt = async (args: string[]): Promise<string> => {
    const prompt = `Simulate the command: apt ${args.join(' ')}`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: aptSystemInstruction,
          temperature: 0.4,
        },
      });
      return response.text.trim();
    } catch (error) {
        console.error("Error executing Gemini apt sim:", error);
        if (error instanceof Error) {
            return `[ERROR] AI service failed: ${error.message}`;
        }
        return "[ERROR] An unknown error occurred while contacting the AI service.";
    }
};

const neofetchSystemInstruction = `You are a neofetch simulator for Kali Linux. Your task is to generate a realistic neofetch output.

Rules:
1.  **ASCII Art:** The output must start with the Kali Linux dragon logo in ASCII art on the left.
2.  **System Info:** To the right of the logo, display a list of plausible but fake system information. The fields should include: OS, Host, Kernel, Uptime, Packages, Shell, Resolution, DE, WM, Theme, Icons, Terminal, CPU, GPU, Memory.
3.  **Color Codes:** Use terminal color escape codes for a visually appealing output, but since this is a web simulation, use text placeholders like \`root@kali\` for the title and standard text for the info. The ASCII art should be plain text.
4.  **Raw Text Only:** Your entire response should be the raw neofetch output. No explanations.
`;

export const simulateNeofetch = async (): Promise<string> => {
    const prompt = "Generate neofetch output for Kali Linux.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: neofetchSystemInstruction,
          temperature: 0.2,
        },
      });
      return response.text.trim();
    } catch (error) {
        console.error("Error executing Gemini neofetch sim:", error);
        if (error instanceof Error) {
            return `[ERROR] AI service failed: ${error.message}`;
        }
        return "[ERROR] An unknown error occurred while contacting the AI service.";
    }
};