---
layout: page
title: LLM Personalization
description: LLM, Huggingface, Scikit Learn, Python, Probabilistic and Neural Retrievers.
img: assets/img/clustering-ir.jpg
importance: 2
category: Graduate
related_publications: false
---
<a href="https://amit010.github.io/assets/pdf/LLM_Personalization.pdf">[Report]</a> <a href='https://github.com/amit-sarker/LLM_Personalization'>[Code]</a>

<strong>Background:</strong> I did this project for the <a href="https://groups.cs.umass.edu/zamani/compsci-646-information-retrieval-fall-2023/">COMPSCI 646: Information Retrieval – Fall'23</a> course at UMass along with <a href="https://mashrur29.github.io/">Mashrur Rashik</a>. Both authors contributed equally in this project.

<strong>Project Title:</strong> Improving Retrieval Accuracy Using Clustering to Personalize Large Language Models.

<p style="text-align:justify">
<strong>Project Overview:</strong> This project focuses on improving the personalization capabilities of Large Language Models (LLMs) by advancing the retrieval of user profile information. By using novel retrieval strategies, including clustering and reranking methods, this project aims to optimize LLM outputs to be more user-specific and contextually relevant.
</p>
The project focuses on the following research questions (RQs):
<ul>
    <li> RQ1: How can relevant information be extracted from a user profile to personalize the output of a Large Language Model (LLM)? </li>
    <li> RQ2: How can the prompt to personalize an LLM output be optimized when the relevant user information is large? </li>
</ul>

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/clustering-ir.jpg" title="project structure" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    This figure shows our clustering approach for retrieval. In our approach, we first cluster the documents using KMeans. We then sample a data point or document from a cluster. Finally, we rerank the documents using contriever.
</div>

<p style="text-align:justify"><strong>Challenges:</strong> This project addresses a suite of challenges related to enhancing the personalization capabilities of Large Language Models (LLMs) through advanced information retrieval strategies.</p>
<ul>
    <li> <p style="text-align:justify">The core challenge is to extract relevant and significant data efficiently from voluminous and diverse user profiles. This is crucial to ensure that the LLM outputs are both contextually relevant and accurate.</p> </li>
    <li> <p style="text-align:justify">The project explores ways to manage large datasets efficiently. It aims to optimize the input sequences for LLMs, making it feasible to process large volumes of data without compromising the quality of the outputs.</p> </li>
    <li> <p style="text-align:justify">One of the significant hurdles is enhancing personalization while operating within the bounds of limited computational resources. The project develops retrieval strategies like clustering and reranking that aim to reduce computational demands while maintaining or enhancing performance.</p> </li>
    <li> <p style="text-align:justify">Achieving a delicate balance between the accuracy of retrieved information and its relevance to the user's context is challenging. Different models are tested to identify methods that can optimize both aspects effectively.</p> </li>
    <li> <p style="text-align:justify">Another challenge is conducting experiments that closely mirror real-world conditions. Using realistic datasets, such as those from the LaMP benchmark, the project validates the effectiveness of different retrieval models in practical scenarios.</p> </li>
</ul>

<p style="text-align:justify"><strong>Methods:</strong> The project used a comprehensive approach to tackle the challenges of personalizing outputs from Large Language Models (LLMs) through information retrieval strategies. Here are the specific solution methods used:</p>
<ol>
    <li> Use of Various Retrieval Models: </li>
    <ul>
        <li> <p style="text-align:justify">BM25 Baseline: Used as a baseline to set a standard for performance comparison with more advanced methods.</p> </li>
        <li> <p style="text-align:justify">Topic-Model Based Retrieval: This method uses BM25 to first rank the data points and then incorporates topic modeling to streamline and shorten the input by focusing on key topics rather than full texts.</p> </li>
        <li> <p style="text-align:justify">Reranking with Contriever: After initial ranking with BM25, this method uses the Contriever model to rerank the results, aiming to improve relevance by refining the selection of user profile data.</p> </li>
        <li> <p style="text-align:justify">Clustering-Based Retrieval: A novel method where documents are clustered using K-Means clustering, and a representative sample from each cluster is then reranked using Contriever. This approach hypothesizes that it can reduce computational load and improve the relevance of the retrieved documents.</p> </li>
    </ul>
    <li> Integration with Flan-T5-base LLM: </li>
    <ul>
        <li> <p style="text-align:justify">The retrieval outputs were integrated as inputs to the Flan-T5-base model to test their effectiveness in generating personalized responses. This step was critical in evaluating how well the retrieved information could be utilized by an LLM in practical scenarios.</p> </li>
    </ul>
</ol>

<p style="text-align:justify"><strong>Discussion & Findings:</strong> The project's findings offer insights to the field of personalized information retrieval for LLMs:</p>
<ol>
    <li> <p style="text-align:justify">Effectiveness of Clustering-Based Retrieval: The clustering-based retrieval method demonstrated promising results, outperforming other techniques in terms of balancing computational efficiency with accuracy and relevance. This suggests that such methods can be particularly useful in scenarios where resources are limited but high personalization is required.</p> </li>
    <li> <p style="text-align:justify">Advantages of Reranking Models: The reranking approach using Contriever showed that it could achieve accuracy comparable to the baseline methods while potentially offering better relevance of results due to its ability to dynamically adjust to the context of the query and user profile.</p> </li>
    <li> <p style="text-align:justify">Impact of Topic Modeling on Query Efficiency: Topic-model based retrieval was found to be effective in reducing the input size, which could lead to faster processing times. Although it sometimes fell short in accuracy compared to the baseline, it offers a trade-off between efficiency and performance that might be acceptable in certain applications.</p> </li>
    <li> <p style="text-align:justify">Scalability and Resource Management: The results highlight the importance of scalable and resource-efficient models in real-world applications. The proposed methods, particularly clustering and reranking, offer ways to manage larger datasets without proportional increases in computational demand.</p> </li>
</ol>
