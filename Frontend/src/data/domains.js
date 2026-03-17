export const domainsList = [
  'Cardiology', 'Radiology', 'Nephrology', 'Oncology - Breast', 
  "Neurology - Parkinson's", 'Endocrinology - Diabetes', 'Hepatology - Liver',
  'Cardiology - Stroke', 'Mental Health', 'Pulmonology - COPD',
  'Haematology - Anaemia', 'Dermatology', 'Ophthalmology', 
  'Orthopaedics - Spine', 'ICU / Sepsis', 'Obstetrics - Fetal Health',
  'Cardiology - Arrhythmia', 'Oncology - Cervical', 'Thyroid / Endocrinology', 
  'Pharmacy - Readmission'
];

export const domainsData = {
  'Cardiology': {
    name: 'Cardiology',
    title: 'Predicting Heart Failure Survival',
    targetVariable: 'DEATH_EVENT',
    description: 'Use patient demographics, blood test results, and medical history to predict survival following heart failure.'
  },
  'Radiology': {
    name: 'Radiology',
    title: 'Pneumonia Detection',
    targetVariable: 'Finding Label',
    description: 'Classify whether a patient has pneumonia based on various clinical findings.'
  },
  'Nephrology': {
    name: 'Nephrology',
    title: 'Chronic Kidney Disease',
    targetVariable: 'classification',
    description: 'Predict the presence of chronic kidney disease using blood and urine tests.'
  },
  'Oncology - Breast': {
    name: 'Oncology - Breast',
    title: 'Breast Cancer Diagnosis',
    targetVariable: 'diagnosis',
    description: 'Classify tumors as malignant or benign based on cell nucleus features.'
  },
  "Neurology - Parkinson's": {
    name: "Neurology - Parkinson's",
    title: "Parkinson's Disease Detection",
    targetVariable: 'status',
    description: 'Detect the presence of Parkinson\'s disease using biomedical voice measurements.'
  },
  'Endocrinology - Diabetes': {
    name: 'Endocrinology - Diabetes',
    title: 'Diabetes Onset Prediction',
    targetVariable: 'Outcome',
    description: 'Predict whether a patient will develop diabetes based on diagnostic measurements.'
  },
  'Hepatology - Liver': {
    name: 'Hepatology - Liver',
    title: 'Liver Disease Prediction',
    targetVariable: 'Dataset',
    description: 'Identify patients with liver disease using demographic and blood test data.'
  },
  'Cardiology - Stroke': {
    name: 'Cardiology - Stroke',
    title: 'Stroke Risk Prediction',
    targetVariable: 'stroke',
    description: 'Predict the likelihood of a stroke based on patient health and lifestyle factors.'
  },
  'Mental Health': {
    name: 'Mental Health',
    title: 'Depression Severity Classification',
    targetVariable: 'severity class',
    description: 'Classify the severity of depression based on patient survey responses.'
  },
  'Pulmonology - COPD': {
    name: 'Pulmonology - COPD',
    title: 'COPD Exacerbation Prediction',
    targetVariable: 'exacerbation',
    description: 'Predict acute exacerbations of Chronic Obstructive Pulmonary Disease.'
  },
  'Haematology - Anaemia': {
    name: 'Haematology - Anaemia',
    title: 'Anaemia Type Classification',
    targetVariable: 'anemia_type',
    description: 'Classify different types of anaemia using complete blood count parameters.'
  },
  'Dermatology': {
    name: 'Dermatology',
    title: 'Skin Lesion Classification',
    targetVariable: 'dx_type',
    description: 'Classify skin lesions into various categories using clinical and dermoscopic features.'
  },
  'Ophthalmology': {
    name: 'Ophthalmology',
    title: 'Diabetic Retinopathy Grading',
    targetVariable: 'severity grade',
    description: 'Grade the severity of diabetic retinopathy from clinical imaging data.'
  },
  'Orthopaedics - Spine': {
    name: 'Orthopaedics - Spine',
    title: 'Spinal Abnormality Classification',
    targetVariable: 'class',
    description: 'Classify patients into normal or abnormal spinal categories using biomechanical features.'
  },
  'ICU / Sepsis': {
    name: 'ICU / Sepsis',
    title: 'Early Sepsis Prediction',
    targetVariable: 'SepsisLabel',
    description: 'Predict the onset of sepsis in ICU patients using vital signs and lab results.'
  },
  'Obstetrics - Fetal Health': {
    name: 'Obstetrics - Fetal Health',
    title: 'Fetal Health Classification',
    targetVariable: 'fetal_health',
    description: 'Classify fetal health state using cardiotocogram (CTG) data.'
  },
  'Cardiology - Arrhythmia': {
    name: 'Cardiology - Arrhythmia',
    title: 'Arrhythmia Classification',
    targetVariable: 'arrhythmia',
    description: 'Detect and classify cardiac arrhythmias from ECG recordings.'
  },
  'Oncology - Cervical': {
    name: 'Oncology - Cervical',
    title: 'Cervical Cancer Risk',
    targetVariable: 'Biopsy',
    description: 'Predict the risk of cervical cancer using demographic and historical medical data.'
  },
  'Thyroid / Endocrinology': {
    name: 'Thyroid / Endocrinology',
    title: 'Thyroid Disease Classification',
    targetVariable: 'class',
    description: 'Classify thyroid conditions based on clinical observations and hormone levels.'
  },
  'Pharmacy - Readmission': {
    name: 'Pharmacy - Readmission',
    title: 'Hospital Readmission Prediction',
    targetVariable: 'readmitted',
    description: 'Predict whether a patient will be readmitted to the hospital within 30 days.'
  }
};
