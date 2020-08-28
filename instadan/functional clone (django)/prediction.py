from imageai.Prediction import ImagePrediction
import os
import functools



@functools.lru_cache(None)
def gen_predictor(exists):
    execution_path = os.getcwd()
    model = ImagePrediction()
    model.setModelTypeAsResNet()
    model.setModelPath( execution_path + "/resnet50_weights_tf_dim_ordering_tf_kernels.h5")
    model.loadModel()
    return model