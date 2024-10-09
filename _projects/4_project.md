---
layout: page
title: ICL Capabilities of LLMs
description: In-Context Learning, LLM, Huggingface,  Chain-of-Thought (CoT).
img: assets/img/icl_analysis.png
importance: 1
category: Graduate
related_publications: false
---
<a href="https://amit-sarker.github.io/assets/pdf/icl_analysis_report.pdf">[Report]</a> <a href='https://github.com/amit-sarker/ICL-Analysis-NLP-685'>[Code]</a>

<strong>Background:</strong> I did this project for the <a href="https://people.cs.umass.edu/~miyyer/cs685/">COMPSCI 685: Advanced Natural Language Processing – Spring'24</a> course at UMass along with four other students. My contribution in this project was exploring the in-context learning capabilities of different LLMs which is described in Section 7 in the report.

<strong>Project Title:</strong> Exploring the New Horizon of Sequence Modeling: Unveiling the Potentials and Challenges of Mamba.

<p style="text-align:justify">
<strong>Project Overview:</strong> This evaluation explores the In-context learning (ICL) capabilities of pre-trained language models on arithmetic tasks and sentiment analysis using synthetic datasets. The goal is to use different prompting strategies—zero-shot, few-shot, and chain-of-thought—to assess the performance of these models on the given tasks. We conducted two types of arithmetic tasks:

<ul>
    <li>Regular Arithmetic: Involves basic arithmetic operations like addition, subtraction, multiplication, and division (using integer division).</li>
    <li>Jumbled Arithmetic: Involves standard arithmetic operations but with new symbols introduced for each operation:</li>
    <ul>
        <li>'$' represents addition, so a $ b equals a + b.</li>
        <li>'#' represents subtraction, so a # b equals a - b.</li>
        <li>'@' represents the operation (a + b) * (a - b), so a @ b equals this calculation.</li>
    </ul>
</ul>

Introducing jumbled arithmetic aims to determine if the model is learning from the prompts or merely recalling from its pre-trained knowledge.
For sentiment analysis, the task is to classify the sentiment (Positive, Negative, or Neutral) of a given text.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/icl_analysis.png" title="project structure" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    This figure shows the examples of demonstrations that are given to LLMs to explore their ICL capabilities.
</div>

<p style="text-align:justify"><strong>Findings:</strong> Here are the major findings of this ICL analysis:</p>

<ul>
    <li> <p style="text-align:justify"> Mistral-7b consistently outperformed other models across all tasks, demonstrating robust performance irrespective of the demonstration type.</p> </li>
    <li> <p style="text-align:justify"> Cerebras-btlm-3b showed limited improvement with increased demonstrations, suggesting potential constraints in its ability to utilize contextual information effectively.</p> </li>
    <li> <p style="text-align:justify"> In regular arithmetic, models generally improved with more demonstrations, with Mamba-7b and Mamba-2.8b particularly benefiting from true label demonstrations.</p> </li>
    <li> <p style="text-align:justify"> Jumbled arithmetic revealed a stark contrast in model performance with CoT prompting, where Mistral-7b excelled significantly, indicating its strong capability to leverage additional contextual cues.</p> </li>
    <li> <p style="text-align:justify"> Sentiment analysis tasks highlighted that all models benefited from demonstrations, especially with true labels. CoT prompting notably enhanced performance, with Cerebras-btlm-3b and Llama2-7b showing considerable gains.</p> </li>
    <li> <p style="text-align:justify"> Demonstrations with random labels generally improved model performance but to a lesser extent compared to demonstrations with true labels.</p> </li>
</ul>






