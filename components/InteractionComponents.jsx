import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 1. 情感反馈滑块组件
export const EmotionSlider = ({ onEmotionChange, houseType, disabled = false }) => {
  const [emotion, setEmotion] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  const handleEmotionChange = (value) => {
    setEmotion(value);
    onEmotionChange({
      value: value,
      houseType: houseType,
      timestamp: Date.now()
    });
  };

  const getEmotionColor = (value) => {
    const intensity = Math.abs(value) / 3;
    if (value > 0) {
      return `rgba(76, 175, 80, ${intensity})`; // 绿色渐变
    } else if (value < 0) {
      return `rgba(244, 67, 54, ${intensity})`; // 红色渐变
    }
    return '#9E9E9E'; // 中性灰色
  };

  const getEmotionEmoji = (value) => {
    if (value >= 2) return '😍';
    if (value >= 1) return '😊';
    if (value > 0) return '🙂';
    if (value === 0) return '😐';
    if (value >= -1) return '🙁';
    if (value >= -2) return '😞';
    return '😫';
  };

  return (
    <div className="emotion-slider-container">
      <div className="emotion-display">
        <span className="emotion-emoji" style={{ fontSize: '2rem' }}>
          {getEmotionEmoji(emotion)}
        </span>
        <div className="emotion-value">{emotion}</div>
      </div>
      
      <div className="slider-container">
        <input
          type="range"
          min="-3"
          max="3"
          step="0.1"
          value={emotion}
          disabled={disabled}
          onChange={(e) => handleEmotionChange(parseFloat(e.target.value))}
          onMouseDown={() => setIsActive(true)}
          onMouseUp={() => setIsActive(false)}
          className={`emotion-slider ${isActive ? 'active' : ''}`}
          style={{
            background: `linear-gradient(to right, #f44336 0%, #9E9E9E 50%, #4CAF50 100%)`,
            '--thumb-color': getEmotionColor(emotion)
          }}
        />
        <div className="slider-labels">
          <span>非常不喜欢</span>
          <span>中性</span>
          <span>非常喜欢</span>
        </div>
      </div>
    </div>
  );
};

// 2. 星级评分组件
export const StarRating = ({ dimensions, onRatingChange, houseType }) => {
  const [ratings, setRatings] = useState({});
  const [hoveredStars, setHoveredStars] = useState({});

  const handleStarClick = (dimension, rating) => {
    const newRatings = { ...ratings, [dimension]: rating };
    setRatings(newRatings);
    onRatingChange({
      dimension,
      rating,
      houseType,
      allRatings: newRatings,
      timestamp: Date.now()
    });
  };

  const handleStarHover = (dimension, rating) => {
    setHoveredStars({ ...hoveredStars, [dimension]: rating });
  };

  const handleStarLeave = (dimension) => {
    setHoveredStars({ ...hoveredStars, [dimension]: null });
  };

  return (
    <div className="star-rating-container">
      {dimensions.map((dimension) => (
        <motion.div
          key={dimension}
          className="rating-dimension"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <label className="dimension-label">{dimension}</label>
          <div className="stars-container">
            {[1, 2, 3, 4, 5, 6, 7].map((star) => (
              <motion.button
                key={star}
                className={`star ${
                  star <= (hoveredStars[dimension] || ratings[dimension] || 0)
                    ? 'filled'
                    : 'empty'
                }`}
                onClick={() => handleStarClick(dimension, star)}
                onMouseEnter={() => handleStarHover(dimension, star)}
                onMouseLeave={() => handleStarLeave(dimension)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                ⭐
              </motion.button>
            ))}
          </div>
          <div className="rating-value">
            {ratings[dimension] ? `${ratings[dimension]}/7` : '未评分'}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// 3. 拖拽排序组件
export const DragRanking = ({ items, onRankingChange, title }) => {
  const [rankedItems, setRankedItems] = useState(items);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, item) => {
    setIsDragging(true);
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (draggedItem !== targetItem) {
      const draggedIndex = rankedItems.indexOf(draggedItem);
      const targetIndex = rankedItems.indexOf(targetItem);
      
      const newItems = [...rankedItems];
      newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, draggedItem);
      
      setRankedItems(newItems);
      onRankingChange({
        newOrder: newItems,
        previousOrder: rankedItems,
        timestamp: Date.now()
      });
    }
    
    setDraggedItem(null);
  };

  const moveItem = (item, direction) => {
    const currentIndex = rankedItems.indexOf(item);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < rankedItems.length) {
      const newItems = [...rankedItems];
      [newItems[currentIndex], newItems[newIndex]] = [newItems[newIndex], newItems[currentIndex]];
      
      setRankedItems(newItems);
      onRankingChange({
        newOrder: newItems,
        previousOrder: rankedItems,
        timestamp: Date.now()
      });
    }
  };

  return (
    <div className="drag-ranking-container">
      <h3 className="ranking-title">{title}</h3>
      <div className="ranking-instructions">
        拖拽重新排序，或使用按钮微调（第1位为最喜欢）
      </div>
      
      <div className="ranked-items">
        {rankedItems.map((item, index) => (
          <motion.div
            key={item}
            className={`ranking-item ${isDragging && draggedItem === item ? 'dragging' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, item)}
            layout
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="ranking-position">{index + 1}</div>
            <div className="ranking-content">
              <div className="item-name">{item}</div>
              <div className="item-controls">
                <button
                  onClick={() => moveItem(item, 'up')}
                  disabled={index === 0}
                  className="move-button"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveItem(item, 'down')}
                  disabled={index === rankedItems.length - 1}
                  className="move-button"
                >
                  ↓
                </button>
              </div>
            </div>
            <div className="drag-handle">⋮⋮</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// 4. 房屋对比展示组件
export const ComparisonView = ({ houses, onHouseSelect, onDetailView }) => {
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'slider'
  const [highlightedFeatures, setHighlightedFeatures] = useState([]);

  const handleHouseClick = (house) => {
    setSelectedHouse(house);
    onHouseSelect({
      houseType: house.type,
      selectionTime: Date.now(),
      viewMode: viewMode
    });
  };

  const handleFeatureHighlight = (feature) => {
    setHighlightedFeatures([feature]);
    // 高亮所有房屋的这个特征
    setTimeout(() => setHighlightedFeatures([]), 2000);
  };

  return (
    <div className="comparison-container">
      <div className="comparison-controls">
        <div className="view-mode-switch">
          <button
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
          >
            网格视图
          </button>
          <button
            className={viewMode === 'slider' ? 'active' : ''}
            onClick={() => setViewMode('slider')}
          >
            滑动对比
          </button>
        </div>
        
        <div className="feature-filters">
          {['外观', '功能', '大小', '智能化'].map((feature) => (
            <button
              key={feature}
              className={`feature-button ${
                highlightedFeatures.includes(feature) ? 'highlighted' : ''
              }`}
              onClick={() => handleFeatureHighlight(feature)}
            >
              {feature}
            </button>
          ))}
        </div>
      </div>

      <div className={`houses-container ${viewMode}`}>
        {houses.map((house, index) => (
          <motion.div
            key={house.type}
            className={`house-card ${selectedHouse?.type === house.type ? 'selected' : ''}`}
            onClick={() => handleHouseClick(house)}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="house-image">
              <img src={house.image} alt={house.type} />
              <div className="house-overlay">
                <button
                  className="detail-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDetailView(house);
                  }}
                >
                  查看详情
                </button>
              </div>
            </div>
            
            <div className="house-info">
              <h3 className="house-title">{house.type}</h3>
              <div className="house-features">
                {house.features.map((feature) => (
                  <span
                    key={feature}
                    className={`feature-tag ${
                      highlightedFeatures.includes(feature) ? 'highlighted' : ''
                    }`}
                  >
                    {feature}
                  </span>
                ))}
              </div>
              <div className="house-stats">
                <div className="stat">
                  <span className="stat-label">面积</span>
                  <span className="stat-value">{house.area}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">建造时间</span>
                  <span className="stat-value">{house.buildTime}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedHouse && (
          <motion.div
            className="selection-summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p>已选择：<strong>{selectedHouse.type}</strong></p>
            <button onClick={() => setSelectedHouse(null)}>重新选择</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 5. 语音输入组件
export const VoiceInput = ({ question, onVoiceComplete, onTextInput }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState('voice'); // 'voice' or 'text'
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        onVoiceComplete({
          question: question,
          audioBlob: blob,
          duration: blob.size,
          timestamp: Date.now()
        });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('录音启动失败:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onTextInput({
        question: question,
        text: textInput.trim(),
        timestamp: Date.now()
      });
    }
  };

  return (
    <div className="voice-input-container">
      <div className="question-text">
        <h4>{question}</h4>
      </div>

      <div className="input-mode-selector">
        <button
          className={inputMode === 'voice' ? 'active' : ''}
          onClick={() => setInputMode('voice')}
        >
          🎤 语音回答
        </button>
        <button
          className={inputMode === 'text' ? 'active' : ''}
          onClick={() => setInputMode('text')}
        >
          ✏️ 文字回答
        </button>
      </div>

      {inputMode === 'voice' ? (
        <div className="voice-recording">
          <motion.button
            className={`record-button ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
            transition={isRecording ? { repeat: Infinity, duration: 1 } : {}}
          >
            {isRecording ? '🛑 停止录音' : '🎤 开始录音'}
          </motion.button>
          
          {isRecording && (
            <div className="recording-indicator">
              <div className="recording-dots">
                <span></span><span></span><span></span>
              </div>
              <p>正在录音...</p>
            </div>
          )}

          {audioBlob && (
            <div className="audio-preview">
              <audio controls src={URL.createObjectURL(audioBlob)} />
              <button onClick={() => setAudioBlob(null)}>重新录音</button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-input">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="请在这里输入您的回答..."
            rows={4}
            className="text-input-area"
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim()}
            className="submit-text-button"
          >
            提交回答
          </button>
        </div>
      )}
    </div>
  );
};

// 6. 进度指示器组件
export const ProgressIndicator = ({ currentStep, totalSteps, stepNames }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="progress-container">
      <div className="progress-header">
        <span className="progress-text">
          第 {currentStep} 步，共 {totalSteps} 步
        </span>
        <span className="progress-percentage">{Math.round(progress)}%</span>
      </div>
      
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="step-indicators">
        {stepNames.map((stepName, index) => (
          <div
            key={index}
            className={`step-indicator ${
              index < currentStep ? 'completed' :
              index === currentStep - 1 ? 'current' : 'pending'
            }`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-name">{stepName}</div>
          </div>
        ))}
      </div>
    </div>
  );
};