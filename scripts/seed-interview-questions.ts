import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';
import { Group } from '../models/group';
import { Question } from '../models/question';
import { Taxonomy } from '../models/taxonomy';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface SeedQuestion {
  subjectSlug: string;
  subjectName?: string;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companyTags: string[];
  tags: string[];
  keyPoints: string[];
  answer: string;
}

const QUESTIONS_DATA: SeedQuestion[] = [
  // ─── OPERATING SYSTEMS ─────────────────────────────────────────────
  {
    subjectSlug: 'operating-system',
    subjectName: 'Operating System',
    question: 'Explain the difference between a Process and a Thread, and what happens during a Context Switch.',
    difficulty: 'Easy',
    companyTags: ['Google', 'Amazon', 'Microsoft', 'Uber'],
    tags: ['Processes', 'Threads', 'Concurrency', 'Memory'],
    keyPoints: [
      'Process is an executing program instance with independent address space; threads share address space (heap, code, global data).',
      'Each thread has its own private call stack, CPU registers, and program counter (PC).',
      'Process context switch involves flushing the TLB and reloading page table pointer (CR3 register); thread context switch within same process keeps page tables intact, making it drastically faster.',
    ],
    answer: `### 1. Memory Isolation & Resources
- **Process**: An instance of an executing program with isolated resources. It possesses its own virtual address space (code segment, data segment, heap, stack), file descriptors, and IPC channels.
- **Thread**: The smallest schedulable unit of CPU execution ("lightweight process"). Multiple threads within the same process share:
  - Virtual Address Space (Heap, Code, Static/Global variables)
  - Open file descriptors and OS signals
  - But have private: **Program Counter (PC)**, **CPU Register state**, and **Execution Stack**.

### 2. Context Switching Comparison
| Dimension | Process Context Switch | Thread Context Switch (Same Process) |
| :--- | :--- | :--- |
| **State Saved** | Full PCB (Registers, PC, Memory Maps, FDs) | TCB (Registers, SP, PC only) |
| **Virtual Memory** | Switches page tables (CR3 register) | Reuses existing page tables |
| **Hardware Cache** | **TLB Flushed** / invalidated; cache misses soar | TLB retained; cache remains hot |
| **Overhead** | High (~1,000–10,000 CPU cycles) | Low (~100–1,000 CPU cycles) |

### 3. Interview Trap
*Q: "Can two threads access each other's local variables?"*
**Answer**: Yes, physically. Because they share the same virtual address space, if a thread passes a pointer to its stack frame to another thread, that thread can access it (though doing so is unsafe).`,
  },
  {
    subjectSlug: 'operating-system',
    subjectName: 'Operating System',
    question: 'How does Virtual Memory and Paging work, and what sequence of events occurs during a Page Fault?',
    difficulty: 'Medium',
    companyTags: ['Amazon', 'Microsoft', 'Apple', 'Meta'],
    tags: ['Memory', 'Paging', 'MMU', 'TLB'],
    keyPoints: [
      'Virtual memory gives each process the illusion of a contiguous address space larger than physical RAM.',
      'Address translation is handled by the hardware MMU using Page Tables and accelerated by the TLB (Translation Lookaside Buffer).',
      'A Page Fault is a hardware interrupt triggered when the valid/present bit in a page table entry is 0 (page is swapped out or unmapped).',
      'Handling requires OS trap, saving registers, reading disk frame into RAM, updating page table entry, and restarting the faulted instruction.',
    ],
    answer: `### 1. Architectural Concept
Virtual Memory decouples the programmer's logical address space from physical RAM (DRAM). Memory is partitioned into fixed-size units called **pages** (commonly 4KB), mapped to physical **page frames**.

### 2. Address Translation Pipeline
1. **Virtual Address Decomposition**: Split into \`[Virtual Page Number (VPN) | Offset]\`.
2. **TLB Check**: The hardware **MMU (Memory Management Unit)** checks the **TLB (Translation Lookaside Buffer)** cache.
   - **TLB Hit**: Physical Frame Number (PFN) obtained in ~1 clock cycle.
   - **TLB Miss**: Hardware page table walker parses multi-level page tables (e.g., 4-level x86-64 PML4/PDPT/PD/PT) in RAM.

### 3. Exact Sequence During a Page Fault
1. **CPU Trap**: MMU detects Present/Valid Bit = 0 in Page Table Entry (PTE); triggers interrupt (Vector 14 on x86).
2. **Kernel Trap Handler**: CPU switches to ring 0 kernel mode and preserves user registers on kernel stack.
3. **Fault Analysis**: OS inspects fault address (CR2 register) against Process Virtual Memory Areas (vm_area_struct).
   - If address is invalid -> Raise \`SIGSEGV\` (Segmentation Fault).
   - If address is valid -> Page is on swap or backing file.
4. **Disk I/O**: OS allocates an empty physical frame (running page replacement if RAM is full) and initiates async DMA transfer from disk to frame.
5. **Page Table Update**: Once I/O completes, OS marks PTE valid bit = 1 and sets physical frame number.
6. **Instruction Restart**: CPU restores registers and restarts the exact instruction that faulted.`,
  },
  {
    subjectSlug: 'operating-system',
    subjectName: 'Operating System',
    question: 'What is Thrashing, how do you detect it, and how does the OS mitigate it?',
    difficulty: 'Medium',
    companyTags: ['Amazon', 'Google', 'Cisco'],
    tags: ['Memory', 'Thrashing', 'Performance'],
    keyPoints: [
      'Thrashing occurs when total memory demands of active processes exceed physical RAM, causing the OS to spend more time swapping pages than executing instructions.',
      'CPU utilization drops close to 0% while disk I/O utilization spikes to 100%.',
      'Mitigated via Working Set Model (Peter Denning), Page Fault Frequency (PFF) control, or process suspension.',
    ],
    answer: `### 1. What is Thrashing?
Thrashing is a pathological state where the CPU spends the vast majority of its time servicing page faults and swapping pages to/from disk rather than executing user instructions.

### 2. How to Detect Thrashing
- **Symptom 1**: Disk I/O or swap usage approaches 100% capacity.
- **Symptom 2**: CPU utilization plunges toward near zero.
- **Why?** When processes block waiting for page fault I/O, the OS CPU scheduler thinks CPU is idle and brings in *more* processes, which in turn demand more pages, worsening the thrashing cycle.

### 3. Mitigation Strategies
1. **Working Set Model (Denning)**: Monitor the set of pages referenced by a process in the last $\\Delta$ time units. If $\\sum \\text{WorkingSet}(P_i) > \\text{Total RAM}$, suspend one process.
2. **Page Fault Frequency (PFF)**: Establish upper and lower bounds on page fault rates per process. If rate exceeds upper threshold, allocate more frames; if no frames available, swap out the entire process.
3. **OOM Killer (Linux)**: Under extreme memory pressure, the Linux Out-Of-Memory Killer calculates badness scores and sends \`SIGKILL\` to greedy processes.`,
  },
  {
    subjectSlug: 'operating-system',
    subjectName: 'Operating System',
    question: 'Explain the 4 Coffman conditions for Deadlock, and how Deadlock Prevention differs from Deadlock Avoidance (Banker\'s Algorithm).',
    difficulty: 'Hard',
    companyTags: ['Google', 'Microsoft', 'Oracle', 'Goldman Sachs'],
    tags: ['Deadlocks', 'Concurrency', 'Algorithms'],
    keyPoints: [
      '4 Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait. All 4 must hold simultaneously for deadlock.',
      'Deadlock Prevention: Structurally eliminates at least one condition beforehand (e.g. enforce total ordering on resource acquisition).',
      'Deadlock Avoidance: Dynamically evaluates resource requests at runtime and only grants them if the system remains in a "Safe State" (Banker\'s Algorithm).',
    ],
    answer: `### 1. The 4 Coffman Conditions
A deadlock can occur if and only if all four conditions hold simultaneously:
1. **Mutual Exclusion**: At least one resource is held in a non-shareable mode.
2. **Hold and Wait**: A process holds at least one resource while waiting to acquire additional resources held by others.
3. **No Preemption**: Resources cannot be forcibly seized from a process; they must be released voluntarily.
4. **Circular Wait**: A closed chain of processes exists such that $P_0$ waits for resource held by $P_1$, $P_1$ waits for $P_2$, ..., and $P_n$ waits for $P_0$.

### 2. Prevention vs Avoidance vs Detection
| Strategy | Mechanism | Overhead | Flexibility |
| :--- | :--- | :--- | :--- |
| **Prevention** | Invalidate one Coffman condition statically (e.g., acquire all locks in global numeric order) | Zero runtime algorithm overhead | Inflexible; limits concurrency |
| **Avoidance** | Dynamic Banker's Algorithm: evaluate if granting request leads to a Safe State | High runtime checking per allocation | High flexibility |
| **Detection & Recovery** | Allow deadlock to occur, periodically run cycle detection on Resource Allocation Graph, kill/rollback processes | Post-mortem cost | Maximum resource utilization |

### 3. Banker's Algorithm (Safe State Check)
A state is **Safe** if there exists a safe sequence $\\langle P_1, P_2, \\dots, P_n \\rangle$ such that for each $P_i$, the maximum resources $P_i$ still needs can be satisfied by current available resources plus resources already held by all $P_j$ ($j < i$).`,
  },
  {
    subjectSlug: 'operating-system',
    subjectName: 'Operating System',
    question: 'Compare Mutex, Counting Semaphore, and Spinlock. When should each be used?',
    difficulty: 'Easy',
    companyTags: ['Amazon', 'Google', 'Meta', 'NVIDIA'],
    tags: ['Concurrency', 'Synchronization', 'Mutex', 'Semaphore'],
    keyPoints: [
      'Mutex: Mutual exclusion lock with ownership semantics (only the thread that locked it can unlock it). Sleeps thread on contention.',
      'Counting Semaphore: Signaling mechanism that controls access to N resource instances. Has no ownership (any thread can post/signal).',
      'Spinlock: Busy-waits in a CPU loop without context switching. Ideal for multi-core systems when critical section is extremely short (< context switch overhead).',
    ],
    answer: `### 1. Direct Comparison

| Primitive | Mechanism | Ownership | Blocking Behavior | Best Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Mutex** | Mutual exclusion | **Yes** (Only locker can unlock) | Puts thread to sleep (kernel context switch) | Protecting shared data structures with moderate lock hold times |
| **Semaphore** | Resource counter / signaling | **No** (Any thread can \`signal\`/\`post\`) | Puts thread to sleep when count is 0 | Rate limiting (e.g., connection pools, producer-consumer queues) |
| **Spinlock** | Atomic test-and-set loop | **Yes** | **Busy-waits on CPU** (no context switch) | OS interrupt handlers, tiny critical sections (< context switch cost) |

### 2. When to Use a Spinlock?
- On **multi-core systems** where the critical section takes less time than two context switches (~2–5 microseconds).
- In **interrupt service routines (ISRs)** where sleeping is forbidden by the OS kernel.
- **Never on single-core systems**: The spinning thread starves the thread holding the lock!`,
  },

  // ─── DATABASE MANAGEMENT SYSTEMS (DBMS) ────────────────────────────
  {
    subjectSlug: 'database-management-system',
    subjectName: 'Database Management System',
    question: 'Explain the ACID properties of relational databases and how the database engine implements each property.',
    difficulty: 'Medium',
    companyTags: ['Amazon', 'Microsoft', 'Google', 'Uber', 'Salesforce'],
    tags: ['DBMS', 'ACID', 'Transactions', 'WAL'],
    keyPoints: [
      'Atomicity (All-or-Nothing): Implemented via Write-Ahead Logging (WAL) and Undo Logs.',
      'Consistency (Valid State Transition): Implemented via schema constraints, foreign keys, and application assertions.',
      'Isolation (Concurrent Execution Safety): Implemented via Concurrency Control (2-Phase Locking or MVCC).',
      'Durability (Committed Data Persists): Implemented via WAL flushed to disk (fsync) before commit acknowledge and Redo Logs.',
    ],
    answer: `### 1. Breakdown of ACID Properties

#### **A - Atomicity (All-or-Nothing)**
- **Meaning**: Either all operations in a transaction commit successfully, or all changes are rolled back.
- **Engine Implementation**: **Undo Logging** inside the **WAL (Write-Ahead Log)**. Before modifying any page in RAM buffer pool, the DB writes an undo record. If a crash or abort occurs, the recovery manager replays undo logs backward.

#### **C - Consistency**
- **Meaning**: The database transitions from one valid state to another valid state, satisfying all schema rules, constraints (NOT NULL, UNIQUE, CHECK), and cascade triggers.

#### **I - Isolation**
- **Meaning**: Concurrent transactions execute without interfering with each other.
- **Engine Implementation**:
  - **Pessimistic**: Two-Phase Locking (2PL) with Shared (S) and Exclusive (X) locks.
  - **Optimistic / Snapshot**: **MVCC (Multi-Version Concurrency Control)** where reads do not block writes and writes do not block reads by maintaining row versions with transaction IDs (\`xmin\`/\`xmax\` in Postgres).

#### **D - Durability**
- **Meaning**: Once a transaction is committed, its changes survive crashes, power outages, and reboots.
- **Engine Implementation**: **Redo Logs** in the Write-Ahead Log. Before returning "Commit OK" to client, the log buffer must be flushed to non-volatile disk via \`fsync()\`. During crash recovery (ARIES algorithm), redo logs replay forward to restore committed changes.`,
  },
  {
    subjectSlug: 'database-management-system',
    subjectName: 'Database Management System',
    question: 'Why do relational databases use B+ Trees instead of B-Trees or Binary Search Trees for indexes?',
    difficulty: 'Hard',
    companyTags: ['Google', 'Meta', 'Amazon', 'LinkedIn', 'Oracle'],
    tags: ['DBMS', 'Indexing', 'B+ Tree', 'Data Structures'],
    keyPoints: [
      'B+ Trees store records/pointers ONLY in leaf nodes; internal nodes store only search routing keys, maximizing branch fanout and keeping tree height low (typically 3-4 levels for billions of rows).',
      'Leaf nodes are linked in a bidirectional linked list, enabling extremely fast sequential range scans ($O(N)$ leaf traversals without revisiting parent nodes).',
      'BSTs have poor cache locality and high tree height ($O(\\log_2 N)$ vs $O(\\log_{1000} N)$), resulting in excessive random disk I/O.',
    ],
    answer: `### 1. Core Architectural Differences

| Feature | Binary Search Tree (BST) | Standard B-Tree | B+ Tree |
| :--- | :--- | :--- | :--- |
| **Node Fanout** | 2 | Moderate ($M$) | **Very High** (hundreds to thousands per node) |
| **Data Storage** | Every node stores data | Both internal and leaf nodes store row data | **Leaves ONLY store data/pointers**; internal nodes only store routing keys |
| **Tree Height** | Deep ($O(\\log_2 N)$) | Moderate ($O(\\log_M N)$) | **Ultra Shallow** ($O(\\log_{\\text{fanout}} N)$, usually 3–4 levels) |
| **Range Queries** | In-order traversal across tree levels | Must ascend and descend tree repeatedly | **Direct linked-list scan across leaf nodes** |

### 2. Why High Fanout Matters for Disk & SSDs
- Operating systems and disks read data in **pages / blocks (4KB–16KB)**.
- In a B+ Tree, because internal nodes do not store bulky row payloads, a single 16KB page can fit **~1,000 keys**.
- A 3-level B+ Tree can index:
  $$1000 \\times 1000 \\times 1000 = 1,000,000,000 \\text{ (1 Billion records!)}$$
- The root and level 1 nodes remain cached permanently in RAM buffer pool, requiring at most **1 physical disk read** to locate any row.`,
  },
  {
    subjectSlug: 'database-management-system',
    subjectName: 'Database Management System',
    question: 'Explain Transaction Isolation Levels and the specific read phenomena (Dirty Read, Non-Repeatable Read, Phantom Read) they prevent.',
    difficulty: 'Medium',
    companyTags: ['Amazon', 'Uber', 'Atlassian', 'Microsoft'],
    tags: ['DBMS', 'Transactions', 'Isolation', 'SQL'],
    keyPoints: [
      'Dirty Read: Reading uncommitted changes made by another active transaction (which might later rollback).',
      'Non-Repeatable Read: Reading the same row twice within a transaction yields different column values because another transaction committed an UPDATE.',
      'Phantom Read: Re-running a range query yields new rows that were INSERTED and committed by another transaction.',
      '4 ANSI SQL levels: Read Uncommitted, Read Committed (default in Postgres/Oracle), Repeatable Read (default in MySQL InnoDB), Serializable.',
    ],
    answer: `### 1. The 3 Classic Read Phenomena
1. **Dirty Read**: Transaction $T_1$ modifies row $R$. Transaction $T_2$ reads $R$. $T_1$ executes \`ROLLBACK\`. $T_2$ now operated on data that never officially existed.
2. **Non-Repeatable Read (Fuzzy Read)**: $T_1$ reads row $R$. $T_2$ commits an \`UPDATE\` on $R$. $T_1$ reads $R$ again and sees altered values.
3. **Phantom Read**: $T_1$ queries \`WHERE age > 30\` returning 10 rows. $T_2$ inserts a new row with \`age = 35\` and commits. $T_1$ re-runs the range query and gets 11 rows.

### 2. ANSI SQL Isolation Levels Matrix
| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read | Mechanism in Practice |
| :--- | :---: | :---: | :---: | :--- |
| **Read Uncommitted** | ❌ Allowed | ❌ Allowed | ❌ Allowed | No read locks; reads raw buffer |
| **Read Committed** | ✅ **Prevented** | ❌ Allowed | ❌ Allowed | Snapshot created at *statement* level |
| **Repeatable Read** | ✅ **Prevented** | ✅ **Prevented** | ⚠️ Engine dependent | Snapshot created at *transaction start* (MVCC) |
| **Serializable** | ✅ **Prevented** | ✅ **Prevented** | ✅ **Prevented** | 2PL / Strict SSI (Serializable Snapshot) |

*Note: In MySQL InnoDB, Repeatable Read also prevents Phantom Reads in practice using **Next-Key Locks** (Index-record lock + Gap lock).*`,
  },
  {
    subjectSlug: 'database-management-system',
    subjectName: 'Database Management System',
    question: 'What is Database Sharding, how does it differ from Partitioning, and what are the main architectural challenges?',
    difficulty: 'Hard',
    companyTags: ['Uber', 'Meta', 'Amazon', 'Stripe'],
    tags: ['DBMS', 'Sharding', 'Architecture', 'Scaling'],
    keyPoints: [
      'Partitioning splits large tables into smaller logical chunks on the same database server (horizontal/vertical).',
      'Sharding distributes chunks across distinct physical database servers/nodes.',
      'Sharding strategies: Hash-based (consistent hashing), Range-based, and Directory-based.',
      'Challenges: Cross-shard joins are slow, distributed transactions require 2-Phase Commit (2PC), and shard rebalancing under hot-spots is operationally complex.',
    ],
    answer: `### 1. Partitioning vs Sharding
- **Table Partitioning**: Splitting a table into smaller tables managed by the **same database instance**. E.g., Postgres partitioning an orders table by \`order_date\` range.
- **Database Sharding**: A shared-nothing architecture where data is partitioned horizontally across **multiple autonomous physical database machines**.

### 2. Common Sharding Strategies
1. **Hash-Based (Consistent Hashing)**:
   - Apply hash function: $\\text{ShardID} = \\text{Hash}(\\text{UserID}) \\pmod K$.
   - **Pros**: Uniform data distribution; avoids hotspots.
   - **Cons**: Range queries require querying every single shard (Scatter-Gather).
2. **Range-Based (e.g. ID 1–1M on Node 1, 1M–2M on Node 2)**:
   - **Pros**: Efficient range scans within a shard.
   - **Cons**: Severe write hotspots (latest IDs all bombard the newest node).

### 3. Critical Architectural Trade-offs
- **Cross-Shard Transactions**: Require distributed consensus (2-Phase Commit / Sagas), incurring severe network latency and lock contention.
- **Cross-Shard Joins**: Cannot perform SQL joins in the DB engine; application layer must execute scatter-gather and in-memory joins.
- **Rebalancing & Resharding**: Adding new shards requires migrating millions of rows with zero downtime.`,
  },

  // ─── COMPUTER NETWORKS ─────────────────────────────────────────────
  {
    subjectSlug: 'computer-networks',
    subjectName: 'Computer Networks',
    question: 'Describe the complete step-by-step lifecycle of typing "https://www.google.com" into a browser and pressing Enter.',
    difficulty: 'Medium',
    companyTags: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Uber'],
    tags: ['Networking', 'DNS', 'TCP', 'TLS', 'HTTP'],
    keyPoints: [
      'DNS Resolution: Browser cache -> OS resolver -> Router cache -> ISP Recursive Resolver -> Root Server -> TLD (.com) -> Authoritative Nameserver.',
      'TCP 3-Way Handshake: SYN -> SYN-ACK -> ACK establishes reliable transport socket.',
      'TLS 1.3 Handshake: Client Hello (cipher suites + key share) -> Server Hello (server key share + cert) -> Encrypted Application Data in 1 RTT.',
      'HTTP Request & Response: GET / HTTP/2 or HTTP/3 forwarded via CDN/Load Balancer to web server.',
      'Browser Rendering: Parse HTML -> DOM tree + CSSOM -> Render Tree -> Layout/Reflow -> Paint -> Composite.',
    ],
    answer: `### 1. DNS Resolution (Recursive & Iterative)
1. **Local Lookups**: Browser checks internal DNS cache, OS hosts file, and OS resolver cache.
2. **Recursive DNS Resolver**: ISP / Resolver (e.g. 8.8.8.8) is queried.
3. **Iterative Hierarchy**:
   - **Root Nameserver** (\`.\`) returns TLD server for \`.com\`.
   - **TLD Nameserver** (\`.com\`) returns Google's authoritative nameservers.
   - **Authoritative Nameserver** returns the IP address (\`142.250.190.46\`).

### 2. Transport & Security Handshake
4. **TCP 3-Way Handshake**:
   - Client sends \`SYN (seq=x)\`
   - Server responds \`SYN-ACK (seq=y, ack=x+1)\`
   - Client responds \`ACK (seq=x+1, ack=y+1)\`
5. **TLS 1.3 Handshake (1-RTT)**:
   - Client sends \`ClientHello\` with supported cipher suites and Diffie-Hellman Key Share.
   - Server validates, sends \`ServerHello\` with certificate + server key share.
   - Both sides compute symmetric session keys ($K$) independently.

### 3. Application Request & Rendering
6. **HTTP/2 Request**: Client sends encrypted \`GET / HTTP/2\` multiplexed over the secure socket.
7. **Edge / Load Balancer**: Cloudflare / Google Front End terminates connection and routes request to backend microservices.
8. **Browser Rendering Pipeline**:
   - **DOM & CSSOM**: Parse HTML & CSS into trees.
   - **Render Tree**: Combine visible nodes with computed styles.
   - **Layout**: Calculate geometric coordinates for elements.
   - **Paint & Composite**: Rasterize pixels onto GPU layers.`,
  },
  {
    subjectSlug: 'computer-networks',
    subjectName: 'Computer Networks',
    question: 'Explain TCP Congestion Control: Slow Start, Congestion Avoidance, Fast Retransmit, and Fast Recovery.',
    difficulty: 'Hard',
    companyTags: ['Google', 'Meta', 'Amazon', 'Cloudflare', 'Cisco'],
    tags: ['Networking', 'TCP', 'Congestion Control', 'Transport'],
    keyPoints: [
      'Flow Control protects the receiver buffer (rwnd); Congestion Control protects the intermediate network routers (cwnd).',
      'Slow Start: cwnd starts at 1-10 MSS and doubles every RTT (exponential growth) until reaching ssthresh.',
      'Congestion Avoidance: Once cwnd >= ssthresh, growth switches to linear (+1 MSS per RTT).',
      'Fast Retransmit: Receiving 3 duplicate ACKs triggers immediate retransmission of missing segment without waiting for RTO timer.',
      'Fast Recovery: Avoids dropping cwnd to 1 on packet loss; sets ssthresh = cwnd / 2 and enters linear growth.',
    ],
    answer: `### 1. Flow Control vs Congestion Control
- **Flow Control (End-to-End)**: Regulated by Receiver Window (\`rwnd\`) advertised in TCP header so sender does not overrun receiver's buffer.
- **Congestion Control (Network Pipe)**: Regulated by Congestion Window (\`cwnd\`) maintained locally by sender to prevent overloading network routers. Effective transmission window is:
  $$\\text{Window} = \\min(\\text{cwnd}, \\text{rwnd})$$

### 2. The 4 Core Algorithms

\`\`\`
cwnd
  ^
  |        Slow Start (Exponential)        Congestion Avoidance (Linear)
  |                  /\\                           /---
  |                 /  \\ ssthresh                /
  |                /    ------------------------/
  |               /
  |              /
  +----------------------------------------------------> Time
\`\`\`

1. **Slow Start**:
   - Initial $\\text{cwnd} = 10 \\text{ MSS}$ (on modern OS).
   - For every ACK received, $\\text{cwnd} = \\text{cwnd} + 1 \\text{ MSS}$ (effectively doubles $\\text{cwnd}$ every RTT).
   - Continues until $\\text{cwnd} \\ge \\text{ssthresh}$ (slow start threshold) or packet loss occurs.

2. **Congestion Avoidance (AIMD - Additive Increase Multiplicative Decrease)**:
   - Once $\\text{cwnd} \\ge \\text{ssthresh}$, growth switches to linear: $\\text{cwnd} = \\text{cwnd} + \\frac{1}{\\text{cwnd}}$ per ACK (increases by 1 MSS per RTT).

3. **Fast Retransmit**:
   - If receiver receives out-of-order packets, it sends immediate duplicate ACKs for the last contiguous byte.
   - Upon receiving **3 duplicate ACKs**, sender assumes packet was dropped in transit and immediately retransmits the missing segment **without waiting for the Retransmission Timeout (RTO) timer**.

4. **Fast Recovery**:
   - Instead of resetting $\\text{cwnd} = 1$ (which stalls throughput), sender sets:
     $$\\text{ssthresh} = \\frac{\\text{cwnd}}{2}, \\quad \\text{cwnd} = \\text{ssthresh} + 3 \\text{ MSS}$$
   - Continues linear growth once acknowledgment arrives.`,
  },
  {
    subjectSlug: 'computer-networks',
    subjectName: 'Computer Networks',
    question: 'Compare HTTP/1.1 vs HTTP/2 vs HTTP/3. What problems does each generation solve?',
    difficulty: 'Medium',
    companyTags: ['Cloudflare', 'Netflix', 'Google', 'Meta'],
    tags: ['Networking', 'HTTP', 'QUIC', 'Protocols'],
    keyPoints: [
      'HTTP/1.1: Text-based; persistent connections with Keep-Alive; suffered from Application-layer Head-of-Line (HoL) blocking.',
      'HTTP/2: Binary framing; Single TCP connection with Stream Multiplexing; HPACK header compression; Server Push. Still suffered from Transport-layer TCP HoL blocking.',
      'HTTP/3: Built on QUIC protocol over UDP; independent streams with Zero-RTT connection resumption; completely eliminates TCP Head-of-Line blocking.',
    ],
    answer: `### 1. Evolution Summary Table

| Metric | HTTP/1.1 | HTTP/2 | HTTP/3 |
| :--- | :--- | :--- | :--- |
| **Transport Layer** | TCP | TCP | **QUIC (over UDP)** |
| **Data Format** | Plaintext ASCII | Binary Frames | Binary Frames |
| **Multiplexing** | No (1 req/resp at a time) | **Yes** (Streams over 1 TCP socket) | **Yes** (Independent QUIC streams) |
| **Head-of-Line Blocking** | Application layer HoL | Solved at app layer; **TCP HoL remains** | **Completely Eliminated** |
| **Header Compression** | None | HPACK (static/dynamic table) | QPACK (out-of-order friendly) |
| **Connection Migration**| Fails on IP change (WiFi -> 4G) | Fails on IP change | **Preserved via 64-bit Connection ID** |

### 2. Understanding Head-of-Line (HoL) Blocking
- **HTTP/1.1 HoL**: Client can only make one request per connection at a time. If the first image takes 500ms, all following assets wait behind it.
- **HTTP/2 HoL Problem**: HTTP/2 multiplexes 50 concurrent streams over a *single* TCP socket. If **one TCP packet drops** on the network, the OS TCP stack holds up all data for ALL 50 streams until that single packet is retransmitted!
- **HTTP/3 Solution with QUIC**: Because QUIC runs over UDP, each HTTP stream is an independent flow. A dropped packet on stream #3 only stalls stream #3; streams #1, #2, #4 continue processing with zero delay.`,
  },

  // ─── SYSTEM DESIGN ─────────────────────────────────────────────────
  {
    subjectSlug: 'system-design',
    subjectName: 'System Design',
    question: 'Explain Consistent Hashing and how it prevents catastrophic cache invalidation when servers scale up or down.',
    difficulty: 'Medium',
    companyTags: ['Amazon', 'Google', 'Discord', 'Uber', 'Twitter'],
    tags: ['System Design', 'Consistent Hashing', 'Caching', 'Distributed Systems'],
    keyPoints: [
      'Traditional modulo hashing ($hash(key) \\% N$) invalidates almost 100% of cached keys whenever a server is added or removed ($N \\to N+1$).',
      'Consistent Hashing maps both keys and servers to a circular hash ring ($[0, 2^{32}-1]$).',
      'A key is stored on the first server encountered moving clockwise on the ring.',
      'Adding/removing a server only redistributes $K/N$ keys on average (only immediate neighbor keys move).',
      'Virtual nodes (vnodes) distribute each physical server across dozens of points on the ring to prevent hot spots and ensure uniform load.',
    ],
    answer: `### 1. The Problem with Modulo Hashing
In basic load balancing or caching:
$$\\text{Server} = \\text{Hash}(key) \\pmod N$$
If you have $N = 4$ servers and add 1 server ($N = 5$):
- Over **80% of all keys rehash to different servers**.
- Triggers a **Cache Stampede / Thundering Herd** where millions of requests hit the database directly, crashing the system.

### 2. The Consistent Hashing Ring
1. The hash space is treated as a continuous ring (e.g. 0 to $2^{32}-1$ using SHA-256 or Murmur3).
2. **Server Placement**: Hash server IPs/names onto points along the ring.
3. **Key Lookup**: Hash key onto the ring; move **clockwise** until encountering the first server node.

\`\`\`
          Node A [hash: 1000]
            /           \\
           /             \\
      Key 1 (1200)        \\
        /                  \\
Node C [3500]           Node B [2500]
        \\                  /
         \\                /
          ----------------
\`\`\`

### 3. Adding or Removing a Node
- When a server is removed: Only keys mapped to that specific server shift to the next clockwise neighbor.
- **Result**: Exactly $K / N$ keys migrate on average (where $K$ = total keys, $N$ = total nodes).

### 4. Why Virtual Nodes (Vnodes) are Essential
- Without vnodes, servers end up unevenly spaced on the ring, creating severe load skew.
- **Solution**: Map each physical server to **100–256 virtual nodes** (e.g., \`NodeA#1\`, \`NodeA#2\`, \`NodeA#3\`). This achieves near-perfect uniform distribution of traffic.`,
  },
  {
    subjectSlug: 'system-design',
    subjectName: 'System Design',
    question: 'Explain the CAP Theorem and PACELC Theorem with real-world database examples.',
    difficulty: 'Medium',
    companyTags: ['Amazon', 'Google', 'Meta', 'Netflix', 'LinkedIn'],
    tags: ['System Design', 'Distributed Systems', 'CAP', 'PACELC'],
    keyPoints: [
      'CAP Theorem: In the event of a network Partition (P), a distributed system must choose between Consistency (C) and Availability (A).',
      'Network Partitions are unavoidable in real-world distributed networks; therefore, you cannot choose CA.',
      'CP Systems (e.g., MongoDB with majority write, HBase, Zookeeper/Raft, Spanner) reject writes during a partition to preserve absolute consistency.',
      'AP Systems (e.g., Cassandra, DynamoDB, CouchDB) continue accepting writes during a partition, opting for eventual consistency.',
      'PACELC extends CAP: If Partition (P), choose A or C; Else (E), choose Latency (L) or Consistency (C).',
    ],
    answer: `### 1. CAP Theorem Breakdown
In any asynchronous distributed network:
- **C (Strong Consistency)**: Every read receives the most recent write or an error.
- **A (High Availability)**: Every non-failing node returns a non-error response for every request (no guarantee it is the most recent write).
- **P (Partition Tolerance)**: The system continues to operate despite arbitrary packet drops or network splits between nodes.

**The Golden Rule**: *You cannot "choose" CA*. Network partitions will inevitably happen due to fiber cuts, switch failures, or GC pauses. Therefore, the architectural choice is always: **Under Partition, do you choose CP or AP?**

### 2. CP vs AP Real-World Systems
- **CP (Consistency over Availability)**:
  - Examples: **Google Spanner**, **Apache ZooKeeper**, **Raft/etcd**, **MongoDB** (with \`w: majority\`).
  - Behavior: If a split-brain partition occurs, nodes on the minority partition reject read/write requests to prevent stale or conflicting data.
- **AP (Availability over Consistency)**:
  - Examples: **Apache Cassandra**, **Amazon DynamoDB**, **Riak**.
  - Behavior: Nodes on both sides of partition accept writes. Conflicts are resolved later via Vector Clocks or Last-Write-Wins (LWW).

### 3. The PACELC Theorem (Daniel Abadi)
CAP only describes system behavior during a rare network partition. PACELC explains behavior during the **99.9% of time when the network is healthy**:
$$\\text{If } \\mathbf{P} \\text{ (Partition): } [\\mathbf{A} \\lor \\mathbf{C}] \\quad \\mathbf{E} \\text{lse: } [\\mathbf{L} \\lor \\mathbf{C}]$$
- **PC/EC (e.g., Bigtable, Spanner)**: Choose consistency in partition; choose consistency (slower latency) normally.
- **PA/EL (e.g., DynamoDB, Cassandra)**: Choose availability in partition; choose low latency (async replication) normally.`,
  },
  {
    subjectSlug: 'system-design',
    subjectName: 'System Design',
    question: 'How do you design an API Rate Limiter? Compare Token Bucket, Leaky Bucket, and Sliding Window Counter.',
    difficulty: 'Medium',
    companyTags: ['Stripe', 'Twilio', 'Uber', 'Amazon', 'Google'],
    tags: ['System Design', 'Rate Limiting', 'Redis', 'Algorithms'],
    keyPoints: [
      'Token Bucket: Central bucket filled with tokens at constant rate. Requests consume tokens. Allows bursts of traffic up to bucket capacity.',
      'Leaky Bucket: Requests enter a FIFO queue processed at constant rate (smooths bursty traffic). Drops requests if queue is full.',
      'Sliding Window Counter: Calculates request rate using a weighted combination of current and previous window counts. Highly accurate with minimal memory.',
      'Distributed implementation typically relies on Redis with Lua scripts for atomic increments and TTL expiry.',
    ],
    answer: `### 1. Comparison of Rate Limiting Algorithms

| Algorithm | Allows Traffic Bursts? | Memory Complexity | Implementation Complexity | Best For |
| :--- | :---: | :--- | :--- | :--- |
| **Token Bucket** | **Yes** (up to bucket capacity) | $O(1)$ per user | Low | General API gateways (Amazon, Stripe) |
| **Leaky Bucket** | ❌ No (smooths to steady rate) | $O(\\text{queue size})$ | Medium | Egress systems needing steady outflow (e.g. video encoding) |
| **Fixed Window** | **Yes** (resets at boundary) | $O(1)$ per user | Very Low | Basic protection; suffers from $2\\times$ burst at boundaries |
| **Sliding Window Log**| **Yes** | $O(N)$ (stores every timestamp) | High | Low-traffic, strictly accurate security gates |
| **Sliding Window Counter**| **Yes** (approximated) | $O(1)$ per user | Low | High-throughput distributed APIs |

### 2. Distributed Token Bucket with Redis & Lua
To avoid race conditions between distributed API servers, token verification must be atomic. A single **Redis Lua script** executes without locking:
\`\`\`lua
-- KEYS[1]: User rate limit key (e.g., rate:user_123)
-- ARGV[1]: Max tokens capacity
-- ARGV[2]: Refill rate per second
-- ARGV[3]: Current epoch timestamp
-- ARGV[4]: Requested tokens (usually 1)
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local state = redis.call('HMGET', key, 'tokens', 'last_updated')
local tokens = tonumber(state[1]) or capacity
local last_updated = tonumber(state[2]) or now

-- Compute refilled tokens since last request
local delta = math.max(0, now - last_updated)
tokens = math.min(capacity, tokens + delta * refill_rate)

if tokens >= requested then
    tokens = tokens - requested
    redis.call('HMSET', key, 'tokens', tokens, 'last_updated', now)
    redis.call('EXPIRE', key, math.ceil(capacity / refill_rate) * 2)
    return 1 -- Allowed
else
    return 0 -- Rate limited (HTTP 429)
end
\`\`\``,
  },

  // ─── OBJECT-ORIENTED PROGRAMMING (OOP) ─────────────────────────────
  {
    subjectSlug: 'object-oriented-programming',
    subjectName: 'Object-Oriented Programming',
    question: 'Explain the SOLID principles with concrete, real-world examples and anti-patterns.',
    difficulty: 'Easy',
    companyTags: ['Amazon', 'Microsoft', 'Google', 'Adobe', 'Uber'],
    tags: ['OOP', 'SOLID', 'Design Patterns', 'Clean Code'],
    keyPoints: [
      'S - Single Responsibility: A class should have only one reason to change.',
      'O - Open/Closed: Software entities should be open for extension, but closed for modification.',
      'L - Liskov Substitution: Subtypes must be substitutable for their base types without breaking correctness.',
      'I - Interface Segregation: Clients should not be forced to depend on methods they do not use.',
      'D - Dependency Inversion: High-level modules should depend on abstractions, not on concrete low-level implementations.',
    ],
    answer: `### 1. S: Single Responsibility Principle (SRP)
- **Violation**: An \`Invoice\` class that calculates taxes, formats PDF templates, AND executes SQL inserts to save to the database.
- **Fix**: Decouple into \`InvoiceCalculator\`, \`InvoicePdfRenderer\`, and \`InvoiceRepository\`.

### 2. O: Open/Closed Principle (OCP)
- **Violation**: Using a massive \`switch(paymentType)\` block inside \`processPayment()\`. Every new payment method requires modifying tested production code.
- **Fix**: Define a \`PaymentProcessor\` interface with concrete implementations (\`StripePayment\`, \`PayPalPayment\`). New payment methods extend the interface without altering existing classes.

### 3. L: Liskov Substitution Principle (LSP)
- **Violation**: The classic \`Square extends Rectangle\` flaw. In a Rectangle, setting width does not alter height. If Square overrides \`setWidth(w)\` to update both dimensions, client code expecting standard Rectangle behavior fails.
- **Fix**: Both implement a common \`Shape\` interface with \`getArea()\`.

### 4. I: Interface Segregation Principle (ISP)
- **Violation**: A fat \`Worker\` interface with \`work()\`, \`eatLunch()\`, and \`sleep()\`. A \`RobotWorker\` class is forced to implement empty dummy methods for \`eatLunch()\` and \`sleep()\`.
- **Fix**: Break into focused interfaces: \`Workable\` and \`Feedable\`.

### 5. D: Dependency Inversion Principle (DIP)
- **Violation**: An \`OrderService\` directly instantiates \`private MySQLDatabase db = new MySQLDatabase();\`.
- **Fix**: \`OrderService\` receives a \`DatabaseConnection\` abstraction via constructor dependency injection.`,
  },
  {
    subjectSlug: 'object-oriented-programming',
    subjectName: 'Object-Oriented Programming',
    question: 'How does Dynamic Polymorphism work under the hood in C++/Java (Vtable and Vptr)?',
    difficulty: 'Hard',
    companyTags: ['Google', 'Microsoft', 'NVIDIA', 'Apple'],
    tags: ['OOP', 'Polymorphism', 'Vtable', 'C++', 'Java'],
    keyPoints: [
      'Compile-time polymorphism is resolved during compilation via function overloading and templates/generics.',
      'Runtime (Dynamic) polymorphism is resolved via virtual functions using Virtual Method Tables (vtables) and virtual table pointers (vptrs).',
      'Every class with at least one virtual function has a hidden static vtable containing function pointers to the most-derived implementations.',
      'Every object instance contains a hidden hidden pointer (_vptr) pointing to its class\'s vtable, incurring a ~8-byte memory overhead and one level of pointer indirection.',
    ],
    answer: `### 1. Compile-Time vs Runtime Polymorphism
- **Static (Compile-Time)**: Function overloading, Operator overloading, Templates / Generics. The compiler binds the exact function memory address directly at compile time (Zero runtime overhead).
- **Dynamic (Runtime)**: Overriding virtual methods in derived classes. The exact method implementation cannot be determined until runtime because a base class reference (\`Animal* a\`) may point to a \`Dog\` or a \`Cat\`.

### 2. Under the Hood: Vtable and Vptr
1. **The Vtable (Virtual Method Table)**:
   - For every class that declares or inherits a virtual function, the compiler generates a static array of function pointers stored in the read-only data segment (\`.rodata\`).
2. **The Vptr (Virtual Table Pointer)**:
   - The compiler automatically injects a hidden pointer (\`_vptr\`) as the first member variable of the class.
   - When the constructor runs, it initializes \`_vptr\` to point to the class's specific vtable.

\`\`\`
Object Instance in Heap:
+-------------------+
| _vptr             | ----> Vtable for Dog (.rodata):
+-------------------+       +-----------------------+
| int age           |       | [0] &Dog::speak()     |
+-------------------+       | [1] &Animal::sleep()  |
                            +-----------------------+
\`\`\`

### 3. Execution of \`a->speak()\`
1. CPU dereferences the object pointer to access the first word (\`_vptr\`).
2. CPU offsets into the vtable at index 0 (\`_vptr[0]\`).
3. CPU jumps to the target function address: \`call *(_vptr[0])\`.
- **Cost**: 1 additional pointer dereference + potential CPU instruction cache miss.`,
  },
  {
    subjectSlug: 'object-oriented-programming',
    subjectName: 'Object-Oriented Programming',
    question: 'Explain the Singleton Pattern, how to implement it with Double-Checked Locking in Java/C++, and why it can be an anti-pattern.',
    difficulty: 'Medium',
    companyTags: ['Amazon', 'Microsoft', 'Oracle', 'Goldman Sachs'],
    tags: ['OOP', 'Design Patterns', 'Singleton', 'Concurrency'],
    keyPoints: [
      'Singleton ensures a class has only one instance and provides a global access point to it.',
      'Double-Checked Locking checks for null before acquiring a lock and again after acquiring the lock to avoid synchronization overhead once initialized.',
      'Requires volatile keyword in Java/C++ to prevent CPU instruction reordering.',
      'Considered an anti-pattern when it introduces hidden global mutable state, tightly couples components, and makes unit testing / mocking difficult.',
    ],
    answer: `### 1. Thread-Safe Implementation with Double-Checked Locking
\`\`\`java
public class DatabaseConnection {
    // 1. volatile prevents instruction reordering by the compiler / CPU
    private static volatile DatabaseConnection instance;

    // 2. Private constructor prevents direct instantiation
    private DatabaseConnection() {}

    public static DatabaseConnection getInstance() {
        if (instance == null) { // 1st Check (No locking overhead after initialized)
            synchronized (DatabaseConnection.class) {
                if (instance == null) { // 2nd Check (Guarantees single creation)
                    instance = new DatabaseConnection();
                }
            }
        }
        return instance;
    }
}
\`\`\`

### 2. Why is \`volatile\` Mandatory?
Without \`volatile\`, the JVM / CPU can reorder the steps of object creation:
1. Allocate memory space.
2. Initialize the object fields.
3. Assign memory reference to \`instance\`.

If the CPU reorders step 3 before step 2: Thread A assigns the reference before the constructor finishes. Thread B enters the 1st check, sees \`instance != null\`, and proceeds to use an **incompletely initialized object**, leading to fatal crashes.

### 3. Why Singleton can be an Anti-Pattern
- **Hidden Dependencies**: Classes fetch the singleton globally rather than explicitly declaring dependencies in their constructors.
- **Testing Nightmare**: State persists across unit tests; mock implementations cannot be easily injected.
- **Modern Solution**: Use **Dependency Injection (DI)** containers (Spring, Guice, or NestJS) configured with a Singleton lifetime scope.`,
  },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is missing');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || 'placementdeck',
  });
  console.log('✓ Connected to MongoDB');

  // 1. Ensure all subject groups exist
  const subjectMap = new Map<string, mongoose.Types.ObjectId>();

  const SUBJECTS_CONFIG = [
    {
      slug: 'operating-system',
      name: 'Operating System',
      description: 'Processes, threads, virtual memory, paging, concurrency, file systems, and Linux internals.',
      order: 1,
    },
    {
      slug: 'database-management-system',
      name: 'Database Management System',
      description: 'ACID transactions, indexing, B+ Trees, query optimization, normal forms, and distributed DBs.',
      order: 2,
    },
    {
      slug: 'computer-networks',
      name: 'Computer Networks',
      description: 'OSI & TCP/IP stack, routing, DNS, TLS 1.3, HTTP/2 & HTTP/3, and transport protocols.',
      order: 3,
    },
    {
      slug: 'system-design',
      name: 'System Design',
      description: 'Scalability, microservices, consistent hashing, caching, rate limiting, and message brokers.',
      order: 4,
    },
    {
      slug: 'object-oriented-programming',
      name: 'Object-Oriented Programming',
      description: 'SOLID design principles, dynamic polymorphism, design patterns, and memory models.',
      order: 5,
    },
  ];

  for (const cfg of SUBJECTS_CONFIG) {
    let grp = await Group.findOne({ slug: cfg.slug, kind: 'subject' });
    if (!grp) {
      grp = await Group.create({
        kind: 'subject',
        name: cfg.name,
        slug: cfg.slug,
        description: cfg.description,
        order: cfg.order,
      });
      console.log(`✓ Created missing Subject Group: ${cfg.name}`);
    } else {
      // update description if needed
      grp.name = cfg.name;
      grp.description = cfg.description;
      grp.order = cfg.order;
      await grp.save();
    }
    subjectMap.set(cfg.slug, grp._id);

    // Sync to Taxonomy
    await Taxonomy.updateOne(
      { kind: 'subject', slug: cfg.slug },
      { $setOnInsert: { kind: 'subject', name: cfg.name, slug: cfg.slug } },
      { upsert: true }
    );
  }

  // 2. Upsert Questions
  console.log(`Seeding ${QUESTIONS_DATA.length} high-yield interview questions...`);
  let createdCount = 0;
  let updatedCount = 0;

  for (const q of QUESTIONS_DATA) {
    const subjectId = subjectMap.get(q.subjectSlug);
    if (!subjectId) {
      console.warn(`⚠️ Subject slug not found: ${q.subjectSlug}, skipping.`);
      continue;
    }

    const existing = await Question.findOne({
      question: q.question,
      subjectId,
    });

    if (existing) {
      existing.answer = q.answer;
      existing.difficulty = q.difficulty;
      existing.companyTags = q.companyTags;
      existing.tags = q.tags;
      existing.keyPoints = q.keyPoints;
      existing.isSystem = true;
      await existing.save();
      updatedCount++;
    } else {
      await Question.create({
        subjectId,
        question: q.question,
        answer: q.answer,
        difficulty: q.difficulty,
        companyTags: q.companyTags,
        tags: q.tags,
        keyPoints: q.keyPoints,
        isSystem: true,
      });
      createdCount++;
    }
  }

  console.log(`✓ Seeding complete! Created: ${createdCount}, Updated: ${updatedCount}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Failed to seed interview questions:', err);
  process.exit(1);
});
