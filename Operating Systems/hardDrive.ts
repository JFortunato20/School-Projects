The experiments show that pre-emptive Shortest Job First (SJF), also known as Shortest
Remaining Time First (SRTF), consistently produces the lowest average turnaround time and average wait
time among all valid schedules. In the first test (A=6@0, B=1@2, C=1@3), the most efficient timelines were
those that paused the long process A to immediately run the two shorter jobs when they arrived. For
example, schedules like AABCAAAA achieved an average turnaround time of about 3.33 and an average wait
time of about 0.67, while timelines that delayed the short jobs reached wait times over 2.5. The second test
(A=2@0, B=5@1, C=3@4) showed a similar pattern: schedules that switched from the long process B to run
the shorter process C as soon as it arrived achieved much lower averages (around 1.3–1.7) compared to
those that allowed B to monopolize the CPU (3.3–4.0). Overall, pre-emptive SJF proves to be the most
efficient algorithm for minimizing waiting and turnaround times when processes’ burst times are known.
However, this efficiency comes with trade-offs—SJF can cause starvation for long processes if short ones
keep arriving, it assumes perfect knowledge of CPU bursts, and it ignores context-switching overhead that
would affect performance in a real operating system.

Processes:
A of length 6 arriving at time 0
B of length 1 arriving at time 2
C of length 1 arriving at time 3

Execution timeline ingredients: AAAAAABC
40320.000000 / 720.000000 = 56.000000 total permutations:
AAAAAABC valid
AAAAAACB valid
AAAAABAC valid
AAAAABCA valid
AAAAACAB valid
AAAAACBA valid
AAAABAAC valid
AAAABACA valid
AAAABCAA valid
AAAACAAB valid
AAAACABA valid
AAAACBAA valid
AAABAAAC valid
AAABAACA valid
AAABACAA valid
AAABCAAA valid
AAACAAAB valid
AAACAABA valid
AAACABAA valid
AAACBAAA valid
AABAAAAC valid
AABAAACA valid
AABAACAA valid
AABACAAA valid
AABCAAAA valid
AACAAAAB NOT valid
AACAAABA NOT valid
AACAABAA NOT valid
AACABAAA NOT valid
AACBAAAA NOT valid
ABAAAAAC NOT valid
ABAAAACA NOT valid
ABAAACAA NOT valid
ABAACAAA NOT valid
ABACAAAA NOT valid
ABCAAAAA NOT valid
ACAAAAAB NOT valid
ACAAAABA NOT valid
ACAAABAA NOT valid
ACAABAAA NOT valid
ACABAAAA NOT valid
ACBAAAAA NOT valid
BAAAAAAC NOT valid
BAAAAACA NOT valid
BAAAACAA NOT valid
BAAACAAA NOT valid
BAACAAAA NOT valid
BACAAAAA NOT valid
BCAAAAAA NOT valid
CAAAAAAB NOT valid
CAAAAABA NOT valid
CAAAABAA NOT valid
CAAABAAA NOT valid
CAABAAAA NOT valid
CABAAAAA NOT valid
CBAAAAAA NOT valid

25 Valid Timelines:
AAAAAABC: avgTT = 5.333  avgWT = 2.667
AAAAAACB: avgTT = 5.333  avgWT = 2.667
AAAAABAC: avgTT = 5.333  avgWT = 2.667
AAAAABCA: avgTT = 5.333  avgWT = 2.667
AAAAACAB: avgTT = 5.333  avgWT = 2.667
AAAAACBA: avgTT = 5.333  avgWT = 2.667
AAAABAAC: avgTT = 5.000  avgWT = 2.333
AAAABACA: avgTT = 5.000  avgWT = 2.333
AAAABCAA: avgTT = 4.667  avgWT = 2.000
AAAACAAB: avgTT = 5.000  avgWT = 2.333
AAAACABA: avgTT = 5.000  avgWT = 2.333
AAAACBAA: avgTT = 4.667  avgWT = 2.000
AAABAAAC: avgTT = 4.667  avgWT = 2.000
AAABAACA: avgTT = 4.667  avgWT = 2.000
AAABACAA: avgTT = 4.333  avgWT = 1.667
AAABCAAA: avgTT = 4.000  avgWT = 1.333
AAACAAAB: avgTT = 4.667  avgWT = 2.000
AAACAABA: avgTT = 4.667  avgWT = 2.000
AAACABAA: avgTT = 4.333  avgWT = 1.667
AAACBAAA: avgTT = 4.000  avgWT = 1.333
AABAAAAC: avgTT = 4.333  avgWT = 1.667
AABAAACA: avgTT = 4.333  avgWT = 1.667
AABAACAA: avgTT = 4.000  avgWT = 1.333
AABACAAA: avgTT = 3.667  avgWT = 1.000
AABCAAAA: avgTT = 3.333  avgWT = 0.667


Processes:
A of length 2 arriving at time 0
B of length 5 arriving at time 1
C of length 3 arriving at time 4

Execution timeline ingredients: AABBBBBCCC
3628800.000000 / 1440.000000 = 2520.000000 total permutations:

120 Valid Timelines:
AABBBBBCCC: avgTT = 4.667  avgWT = 1.333
AABBBBCBCC: avgTT = 5.000  avgWT = 1.667
AABBBBCCBC: avgTT = 5.333  avgWT = 2.000
AABBBBCCCB: avgTT = 5.333  avgWT = 2.000
AABBBCBBCC: avgTT = 5.000  avgWT = 1.667
AABBBCBCBC: avgTT = 5.333  avgWT = 2.000
AABBBCBCCB: avgTT = 5.333  avgWT = 2.000
AABBBCCBBC: avgTT = 5.333  avgWT = 2.000
AABBBCCBCB: avgTT = 5.333  avgWT = 2.000
AABBBCCCBB: avgTT = 5.000  avgWT = 1.667
AABBCBBBCC: avgTT = 5.000  avgWT = 1.667
AABBCBBCBC: avgTT = 5.333  avgWT = 2.000
AABBCBBCCB: avgTT = 5.333  avgWT = 2.000
AABBCBCBBC: avgTT = 5.333  avgWT = 2.000
AABBCBCBCB: avgTT = 5.333  avgWT = 2.000
AABBCBCCBB: avgTT = 5.000  avgWT = 1.667
AABBCCBBBC: avgTT = 5.333  avgWT = 2.000
AABBCCBBCB: avgTT = 5.333  avgWT = 2.000
AABBCCBCBB: avgTT = 5.000  avgWT = 1.667
AABBCCCBBB: avgTT = 4.667  avgWT = 1.333
ABABBBBCCC: avgTT = 5.000  avgWT = 1.667
ABABBBCBCC: avgTT = 5.333  avgWT = 2.000
ABABBBCCBC: avgTT = 5.667  avgWT = 2.333
ABABBBCCCB: avgTT = 5.667  avgWT = 2.333
ABABBCBBCC: avgTT = 5.333  avgWT = 2.000
ABABBCBCBC: avgTT = 5.667  avgWT = 2.333
ABABBCBCCB: avgTT = 5.667  avgWT = 2.333
ABABBCCBBC: avgTT = 5.667  avgWT = 2.333
ABABBCCBCB: avgTT = 5.667  avgWT = 2.333
ABABBCCCBB: avgTT = 5.333  avgWT = 2.000
ABABCBBBCC: avgTT = 5.333  avgWT = 2.000
ABABCBBCBC: avgTT = 5.667  avgWT = 2.333
ABABCBBCCB: avgTT = 5.667  avgWT = 2.333
ABABCBCBBC: avgTT = 5.667  avgWT = 2.333
ABABCBCBCB: avgTT = 5.667  avgWT = 2.333
ABABCBCCBB: avgTT = 5.333  avgWT = 2.000
ABABCCBBBC: avgTT = 5.667  avgWT = 2.333
ABABCCBBCB: avgTT = 5.667  avgWT = 2.333
ABABCCBCBB: avgTT = 5.333  avgWT = 2.000
ABABCCCBBB: avgTT = 5.000  avgWT = 1.667
ABBABBBCCC: avgTT = 5.333  avgWT = 2.000
ABBABBCBCC: avgTT = 5.667  avgWT = 2.333
ABBABBCCBC: avgTT = 6.000  avgWT = 2.667
ABBABBCCCB: avgTT = 6.000  avgWT = 2.667
ABBABCBBCC: avgTT = 5.667  avgWT = 2.333
ABBABCBCBC: avgTT = 6.000  avgWT = 2.667
ABBABCBCCB: avgTT = 6.000  avgWT = 2.667
ABBABCCBBC: avgTT = 6.000  avgWT = 2.667
ABBABCCBCB: avgTT = 6.000  avgWT = 2.667
ABBABCCCBB: avgTT = 5.667  avgWT = 2.333
ABBACBBBCC: avgTT = 5.667  avgWT = 2.333
ABBACBBCBC: avgTT = 6.000  avgWT = 2.667
ABBACBBCCB: avgTT = 6.000  avgWT = 2.667
ABBACBCBBC: avgTT = 6.000  avgWT = 2.667
ABBACBCBCB: avgTT = 6.000  avgWT = 2.667
ABBACBCCBB: avgTT = 5.667  avgWT = 2.333
ABBACCBBBC: avgTT = 6.000  avgWT = 2.667
ABBACCBBCB: avgTT = 6.000  avgWT = 2.667
ABBACCBCBB: avgTT = 5.667  avgWT = 2.333
ABBACCCBBB: avgTT = 5.333  avgWT = 2.000
ABBBABBCCC: avgTT = 5.667  avgWT = 2.333
ABBBABCBCC: avgTT = 6.000  avgWT = 2.667
ABBBABCCBC: avgTT = 6.333  avgWT = 3.000
ABBBABCCCB: avgTT = 6.333  avgWT = 3.000
ABBBACBBCC: avgTT = 6.000  avgWT = 2.667
ABBBACBCBC: avgTT = 6.333  avgWT = 3.000
ABBBACBCCB: avgTT = 6.333  avgWT = 3.000
ABBBACCBBC: avgTT = 6.333  avgWT = 3.000
ABBBACCBCB: avgTT = 6.333  avgWT = 3.000
ABBBACCCBB: avgTT = 6.000  avgWT = 2.667
ABBBBABCCC: avgTT = 6.000  avgWT = 2.667
ABBBBACBCC: avgTT = 6.333  avgWT = 3.000
ABBBBACCBC: avgTT = 6.667  avgWT = 3.333
ABBBBACCCB: avgTT = 6.667  avgWT = 3.333
ABBBBBACCC: avgTT = 6.000  avgWT = 2.667
ABBBBBCACC: avgTT = 6.333  avgWT = 3.000
ABBBBBCCAC: avgTT = 6.667  avgWT = 3.333
ABBBBBCCCA: avgTT = 6.667  avgWT = 3.333
ABBBBCABCC: avgTT = 6.667  avgWT = 3.333
ABBBBCACBC: avgTT = 7.000  avgWT = 3.667
ABBBBCACCB: avgTT = 7.000  avgWT = 3.667
ABBBBCBACC: avgTT = 6.667  avgWT = 3.333
ABBBBCBCAC: avgTT = 7.000  avgWT = 3.667
ABBBBCBCCA: avgTT = 7.000  avgWT = 3.667
ABBBBCCABC: avgTT = 7.333  avgWT = 4.000
ABBBBCCACB: avgTT = 7.333  avgWT = 4.000
ABBBBCCBAC: avgTT = 7.333  avgWT = 4.000
ABBBBCCBCA: avgTT = 7.333  avgWT = 4.000
ABBBBCCCAB: avgTT = 7.333  avgWT = 4.000
ABBBBCCCBA: avgTT = 7.333  avgWT = 4.000
ABBBCABBCC: avgTT = 6.333  avgWT = 3.000
ABBBCABCBC: avgTT = 6.667  avgWT = 3.333
ABBBCABCCB: avgTT = 6.667  avgWT = 3.333
ABBBCACBBC: avgTT = 6.667  avgWT = 3.333
ABBBCACBCB: avgTT = 6.667  avgWT = 3.333
ABBBCACCBB: avgTT = 6.333  avgWT = 3.000
ABBBCBABCC: avgTT = 6.667  avgWT = 3.333
ABBBCBACBC: avgTT = 7.000  avgWT = 3.667
ABBBCBACCB: avgTT = 7.000  avgWT = 3.667
ABBBCBBACC: avgTT = 6.667  avgWT = 3.333
ABBBCBBCAC: avgTT = 7.000  avgWT = 3.667
ABBBCBBCCA: avgTT = 7.000  avgWT = 3.667
ABBBCBCABC: avgTT = 7.333  avgWT = 4.000
ABBBCBCACB: avgTT = 7.333  avgWT = 4.000
ABBBCBCBAC: avgTT = 7.333  avgWT = 4.000
ABBBCBCBCA: avgTT = 7.333  avgWT = 4.000
ABBBCBCCAB: avgTT = 7.333  avgWT = 4.000
ABBBCBCCBA: avgTT = 7.333  avgWT = 4.000
ABBBCCABBC: avgTT = 7.000  avgWT = 3.667
ABBBCCABCB: avgTT = 7.000  avgWT = 3.667
ABBBCCACBB: avgTT = 6.667  avgWT = 3.333
ABBBCCBABC: avgTT = 7.333  avgWT = 4.000
ABBBCCBACB: avgTT = 7.333  avgWT = 4.000
ABBBCCBBAC: avgTT = 7.333  avgWT = 4.000
ABBBCCBBCA: avgTT = 7.333  avgWT = 4.000
ABBBCCBCAB: avgTT = 7.333  avgWT = 4.000
ABBBCCBCBA: avgTT = 7.333  avgWT = 4.000
ABBBCCCABB: avgTT = 6.667  avgWT = 3.333
ABBBCCCBAB: avgTT = 7.000  avgWT = 3.667
ABBBCCCBBA: avgTT = 7.000  avgWT = 3.667

