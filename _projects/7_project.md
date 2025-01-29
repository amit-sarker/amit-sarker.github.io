---
layout: page
title: Occlusion Aware Vehicle Detection
description: NN, YOLO, Localization.
img: assets/img/architecture2.png
importance: 1
category: Graduate
related_publications: false
---
<a href="https://amit-sarker.github.io/assets/pdf/Occlusion_Aware_Vehicle_Detection.pdf">[Report]</a> <a href='https://github.com/amit-sarker/vehicle-detection-with-occlusion'>[Code]</a>

<strong>Background:</strong> I did this project for the <a href="https://cvl-umass.github.io/compsci682-fall-2024/index.html">COMPSCI 682: Neural Networks: A Modern Introduction – Fall'24</a> course at UMass along with two other students. My contribution in this project was developing a two-stage detection pipeline integrating a ResNet-18 secondary classifier into YOLOv5m, enhancing detection accuracy by refining predictions and reducing false positives. Additionally, I created a custom dataset for training the secondary classifier, ensuring better differentiation between true and false positives, and demonstrated that our approach improves detection accuracy while maintaining computational efficiency across the YOLOv5 family.

<strong>Project Title:</strong> Occlusion-aware Module for 2D Object Detection for Autonomous Driving.

<p style="text-align:justify">
<strong>Project Overview:</strong> This project presents a two-stage detection pipeline that enhances YOLOv5m by integrating a ResNet-18 secondary classifier. Our approach refines detection predictions, reducing false detections while improving localization accuracy for occluded objects. Specifically,

<ul>
    <li>We designed a two-stage object detection system integrating ResNet-18 with YOLOv5m, improving localization accuracy and reducing false positives (improving mAP by 24.7%) in occluded scenarios.</li>
    <li>We fine-tuned YOLOv5m with occlusion-aware modules, achieving a 44.5\% improvement in small-object detection in coco vehicle dataset.</li>
</ul>

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/architecture2.png" title="project architecture" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Overview of Object Detection Architecture.
</div>

<p style="text-align:justify"><strong>Findings:</strong> Here are the major findings of this project:</p>

<ul>
    <li> <p style="text-align:justify"> The integration of a ResNet-18 secondary classifier into YOLOv5m reduced false positives and misclassifications, leading to a 24.6% increase in AP@IoU=0.5 (from 0.511 to 0.637).</p> </li>
    <li> <p style="text-align:justify"> The occlusion-aware bounding box enhancement method significantly improved localization accuracy for occluded objects without requiring model retraining.</p> </li>
    <li> <p style="text-align:justify"> The model achieved a 44.5% improvement in AP for small vehicles (from 0.236 to 0.341) and a 28.1% increase for medium vehicles (from 0.477 to 0.611).</p> </li>
    <li> <p style="text-align:justify"> Despite performance improvements, the model retained the computational efficiency of YOLOv5m, making it suitable for real-time applications.</p> </li>
    <li> <p style="text-align:justify"> The proposed model improved AR@[0.5:0.95] by 22.3% (from 0.557 to 0.681) and AR@IoU=0.75 by 23.3% (from 0.548 to 0.676), ensuring higher detection consistency across different vehicle categories.</p> </li>
    <li> <p style="text-align:justify"> While YOLOv5x achieved a slightly higher AP@IoU=0.5 (0.672), our model offers a competitive alternative with significantly lower computational costs, making it a better choice for real-time autonomous driving applications.</p> </li>
</ul>






