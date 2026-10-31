# Synthetic receipt extraction comparison

New evidence recorded on 1 November 2026 MYT; raw timestamps use UTC. This is an offline diagnostic evaluation, not a test of live payment approval.

| Run | Correct fields | Exact receipts | Rule false-eligible cases |
| --- | --- | --- | --- |
| [KrackedDevs gpt-5.4-mini, 36 images](krackeddevs/2026-10-31T17-15-47-020Z/results.json) | 249/252 | 33/36 | 6/36 |
| [CPU OCR, paired baseline](../ocr-expanded/results.json) | 224/252 | 27/36 | 0/36 |

[Single-image preliminary call](krackeddevs/2026-10-31T17-15-18-208Z/results.json) is separate from the 36-image run; do not add it to the sample count.

The set contains synthetic, correlated layouts and is not held out. Three model field errors concern ambiguous multiple-amount images; the model did not flag those errors itself. The model run's p50 wall latency was 3336 ms and includes network time. CPU timings use local hardware, so these are not a controlled speed comparison.

The raw result note says the prompt is the same as the RunPod run. That sentence is inaccurate for the historical 22 October GPU comparison: the latest run records receipt-fields.v2 while the historical GPU run used v1. Preserve raw records, but do not present historical GPU numbers as a controlled same-prompt comparison.

False eligible means a pure rule result, not an executed approval or release. CPU cross-check disagreement can escalate review; the current Owner workflow still permits reasoned manual acceptance. These results do not establish fraud detection accuracy or prove that unsafe payments cannot be manually accepted. Human task time and merchant impact remain not measured.

No model calls were repeated as part of publishing these existing results. Reproduction requires explicitly configured provider credentials and incurs provider usage; never commit credentials.
