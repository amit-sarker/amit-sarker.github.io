---
layout: page
title: Privacy Risk of ML Models
description: NN, RNN, Adversarial Regularization, MemGuard
img: assets/img/project2.png
importance: 4
category: Graduate
giscus_comments: false
---
<a href="https://amit-sarker.github.io/assets/pdf/privacy_risk_ML_Models.pdf">[Report]</a> <a href='https://github.com/amit-sarker/MIA-Evaluation'>[Code]</a>

<strong>Background:</strong> I did this project for the <a href="https://people.cs.umass.edu/~amir/courses/CS660-FALL22/">COMPSCI 660: Advanced Information Assurance – Fall'22</a> course at UMass along with <a href="https://mashrur29.github.io/">Mashrur Rashik</a> and Erfan Entezami. All authors contributed equally in this project.

<strong>Project Title:</strong> The Effectiveness of NN-based Defense Models Against Membership Inference Attacks.

<p style="text-align:justify">
<strong>Project Overview:</strong> This project addresses the critical need for robust defense mechanisms in machine learning to protect sensitive training data against membership inference attacks. By assessing the vulnerability of neural network-based models and evaluating existing defenses, we introduce a novel privacy risk score that quantifies the likelihood of individual data samples belonging to a model's training set.
</p>
The project focuses on the following research questions (RQs):
<ul>
    <li> RQ1: How vulnerable are neural network-based models to membership inference attacks? </li>
    <li> RQ2: What is the effectiveness of existing neural network-based defense mechanisms in protecting against these attacks? </li>
    <li> RQ3: Can a new privacy risk score accurately measure the privacy risks associated with individual data samples in machine learning models? </li>
</ul>

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/project2.png" title="MI Attack" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Improving existing attacks with class-dependent thresholds.
</div>

<p style="text-align:justify"><strong>Methods:</strong> The methods used in this project on evaluating neural network-based defense models against membership inference attacks include the following key approaches:</p>
<ul>
    <li> <p style="text-align:justify">Benchmarking Membership Inference Attacks: The project uses a suite of neural network (NN)-based and metric-based membership inference attacks to evaluate the privacy risks of machine learning models. This involves testing both black-box and white-box attack scenarios to determine how easily an adversary can infer membership in the training dataset.</p> </li>
    <li> <p style="text-align:justify">Defense Evaluation: Various defense mechanisms, such as adversarial regularization and MemGuard, are assessed for their effectiveness in protecting against membership inference attacks. These defenses are applied to the models to see if they can thwart or mitigate the attacks, measuring the degree to which they can preserve privacy without sacrificing model performance.</p> </li>
    <li> <p style="text-align:justify">Development of a Privacy Risk Score: A novel privacy risk score is developed to provide a fine-grained measure of privacy risks at the individual sample level. This score calculates the probability that a particular data sample was part of the model’s training set based on the model's output behavior on that sample.</p> </li>
    <li> <p style="text-align:justify">Implementation of Metric-Based Attacks: In addition to NN-based attacks, the project introduces metric-based attacks that utilize simpler statistical metrics (such as prediction correctness, confidence, and entropy) to estimate privacy leaks. These metrics provide an alternative method to assess the model’s vulnerability to membership inference without needing complex model training.</p> </li>
    <li> <p style="text-align:justify">Empirical Testing and Validation: The models and defenses are empirically tested using datasets like <a href="https://www.comp.nus.edu.sg/~reza/files/dataset_texas.tgz">Texas-100</a> and <a href="https://www.comp.nus.edu.sg/~reza/files/dataset_purchase.tgz">Purchase 100</a>. The project includes extensive simulations to validate the effectiveness of the privacy risk score and the overall resilience of the defenses. This includes training shadow models to mimic the target model's behavior and using these models to evaluate the proposed metrics and privacy risk scores.</p> </li>
    <li> <p style="text-align:justify">Comparative Analysis: The results from both NN-based and metric-based attacks are compared to determine which methods reveal more significant privacy leaks. This comparative analysis helps in understanding the strengths and weaknesses of different approaches to protecting privacy.</p> </li>
</ul>


<ul>
    <li> <p style="text-align:justify">Vulnerability of Models: Neural network models are consistently vulnerable to membership inference attacks, indicating significant privacy risks across various model architectures and defense strategies.</p> </li>
    <li> <p style="text-align:justify">Defense Effectiveness: Traditional defense mechanisms like adversarial regularization and MemGuard provide partial protection but are not foolproof, particularly against sophisticated attacks.</p> </li>
    <li> <p style="text-align:justify">Privacy Risk Score: The developed privacy risk score effectively quantifies individual privacy risks by assessing the likelihood of a data sample being part of the training set, offering a more precise tool than previous methods.</p> </li>
    <li> <p style="text-align:justify">Efficiency of Metric-Based Attacks: Metric-based attacks can be as effective As complex neural network-based attacks in detecting privacy leaks, highlighting the potential for more efficient privacy risk assessments.</p> </li>
    <li> <p style="text-align:justify">Trade-offs and Challenges: The findings discuss the trade-offs between model utility and privacy, with stronger protections often compromising model performance, posing challenges for sensitive applications.</p> </li>
</ul>

