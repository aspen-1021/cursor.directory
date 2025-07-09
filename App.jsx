import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EventManager, EventAnalyzer } from './utils/EventManager.js';
import {
  EmotionSlider,
  StarRating,
  DragRanking,
  ComparisonView,
  VoiceInput,
  ProgressIndicator
} from './components/InteractionComponents.jsx';
import './styles/App.css';

// 主应用程序组件
function App() {
  // 状态管理
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionId] = useState(() => generateSessionId());
  const [userProfile, setUserProfile] = useState({});
  const [surveyData, setSurveyData] = useState({
    demographics: {},
    initialPreferences: {},
    houseRatings: {},
    finalRanking: [],
    interviews: {}
  });
  
  // 事件管理器
  const eventManagerRef = useRef(null);
  
  // 实验配置
  const stepNames = ['欢迎', '基本信息', '预期调查', '房屋展示', '对比评估', '深度访谈', '完成'];
  const houseTypes = ['大型房屋', '中型房屋', '小型房屋'];
  const [houseDisplayOrder, setHouseDisplayOrder] = useState([]);

  // 房屋数据
  const housesData = {
    '大型房屋': {
      type: '大型房屋',
      image: '/images/large-house.jpg',
      video: '/videos/large-house-build.mp4',
      features: ['豪华', '多功能', '智能化', '大空间'],
      area: '300-500㎡',
      buildTime: '3-5天',
      description: '豪华别墅级住宅，配备完整的智能家居系统'
    },
    '中型房屋': {
      type: '中型房屋',
      image: '/images/medium-house.jpg',
      video: '/videos/medium-house-build.mp4',
      features: ['实用', '经济', '适中', '平衡'],
      area: '100-200㎡',
      buildTime: '2-3天',
      description: '标准家庭住宅，平衡实用性与经济性'
    },
    '小型房屋': {
      type: '小型房屋',
      image: '/images/small-house.jpg',
      video: '/videos/small-house-build.mp4',
      features: ['紧凑', '高效', '经济', '环保'],
      area: '50-100㎡',
      buildTime: '1-2天',
      description: '紧凑型高效住宅，适合单身或小家庭'
    }
  };

  // 初始化
  useEffect(() => {
    // 创建事件管理器
    eventManagerRef.current = new EventManager(sessionId);
    
    // 尝试恢复之前的数据
    const restored = eventManagerRef.current.loadFromLocalStorage();
    if (restored) {
      console.log('恢复了之前的会话数据');
    }

    // 随机化房屋展示顺序
    const randomOrder = [...houseTypes].sort(() => Math.random() - 0.5);
    setHouseDisplayOrder(randomOrder);

    // 设置初始阶段
    eventManagerRef.current.setPhase('welcome');

    // 清理函数
    return () => {
      if (eventManagerRef.current) {
        eventManagerRef.current.cleanup();
      }
    };
  }, [sessionId]);

  // 生成会话ID
  function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 步骤导航
  const nextStep = () => {
    if (currentStep < stepNames.length - 1) {
      setCurrentStep(currentStep + 1);
      eventManagerRef.current?.setPhase(stepNames[currentStep + 1].toLowerCase());
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      eventManagerRef.current?.setPhase(stepNames[currentStep - 1].toLowerCase());
    }
  };

  // 事件处理器
  const handleDemographicsSubmit = (data) => {
    setUserProfile(data);
    setSurveyData(prev => ({ ...prev, demographics: data }));
    eventManagerRef.current?.handleQuestionnaireResponse({
      questionId: 'demographics',
      questionType: 'form',
      response: data,
      responseTime: Date.now(),
      timestamp: Date.now()
    });
    nextStep();
  };

  const handleInitialPreferences = (data) => {
    setSurveyData(prev => ({ ...prev, initialPreferences: data }));
    eventManagerRef.current?.handleQuestionnaireResponse({
      questionId: 'initial_preferences',
      questionType: 'multiple_choice',
      response: data,
      responseTime: Date.now(),
      timestamp: Date.now()
    });
    nextStep();
  };

  const handleHouseRating = (houseType, ratings) => {
    setSurveyData(prev => ({
      ...prev,
      houseRatings: {
        ...prev.houseRatings,
        [houseType]: ratings
      }
    }));
  };

  const handleFinalRanking = (ranking) => {
    setSurveyData(prev => ({ ...prev, finalRanking: ranking }));
    eventManagerRef.current?.handleRankingChange({
      newOrder: ranking,
      previousOrder: houseTypes,
      timestamp: Date.now()
    });
  };

  const handleInterviewResponse = (questionId, response) => {
    setSurveyData(prev => ({
      ...prev,
      interviews: {
        ...prev.interviews,
        [questionId]: response
      }
    }));
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={nextStep} />;
      
      case 1:
        return (
          <DemographicsStep 
            onSubmit={handleDemographicsSubmit}
            eventManager={eventManagerRef.current}
          />
        );
      
      case 2:
        return (
          <InitialPreferencesStep 
            onSubmit={handleInitialPreferences}
            eventManager={eventManagerRef.current}
          />
        );
      
      case 3:
        return (
          <HouseExhibitionStep 
            houses={houseDisplayOrder.map(type => housesData[type])}
            onRatingChange={handleHouseRating}
            onComplete={nextStep}
            eventManager={eventManagerRef.current}
          />
        );
      
      case 4:
        return (
          <ComparisonStep 
            houses={Object.values(housesData)}
            surveyData={surveyData}
            onRankingChange={handleFinalRanking}
            onComplete={nextStep}
            eventManager={eventManagerRef.current}
          />
        );
      
      case 5:
        return (
          <InterviewStep 
            surveyData={surveyData}
            onResponse={handleInterviewResponse}
            onComplete={nextStep}
            eventManager={eventManagerRef.current}
          />
        );
      
      case 6:
        return (
          <CompletionStep 
            surveyData={surveyData}
            eventManager={eventManagerRef.current}
          />
        );
      
      default:
        return <div>步骤不存在</div>;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>机器人建筑用户偏好研究</h1>
        <ProgressIndicator 
          currentStep={currentStep + 1}
          totalSteps={stepNames.length}
          stepNames={stepNames}
        />
      </header>

      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="step-container"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="app-footer">
        <div className="navigation-controls">
          <button 
            onClick={prevStep} 
            disabled={currentStep === 0}
            className="nav-button prev"
          >
            ← 上一步
          </button>
          
          <div className="step-info">
            {currentStep + 1} / {stepNames.length}
          </div>
          
          {currentStep < stepNames.length - 1 && (
            <button 
              onClick={nextStep}
              className="nav-button next"
            >
              下一步 →
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

// 欢迎步骤组件
const WelcomeStep = ({ onNext }) => (
  <motion.div 
    className="welcome-step"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <h2>欢迎参与机器人建筑用户偏好研究</h2>
    <div className="welcome-content">
      <p>本研究旨在了解用户对机器人搭建不同规模房屋的偏好和看法。</p>
      <p>整个过程大约需要40分钟，包括：</p>
      <ul>
        <li>📝 基本信息填写 (5分钟)</li>
        <li>🎯 初始偏好调查 (3分钟)</li>
        <li>🏠 房屋展示观看 (15分钟)</li>
        <li>⚖️ 对比评估 (8分钟)</li>
        <li>💬 深度访谈 (10分钟)</li>
      </ul>
      <p className="privacy-note">
        您的所有回答将被严格保密，仅用于学术研究目的。
      </p>
    </div>
    <button onClick={onNext} className="start-button">
      开始参与研究
    </button>
  </motion.div>
);

// 基本信息步骤组件
const DemographicsStep = ({ onSubmit, eventManager }) => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    education: '',
    occupation: '',
    residence: '',
    techAcceptance: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    eventManager?.recordEvent({
      type: 'form_input',
      field: field,
      value: value,
      timestamp: Date.now()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="demographics-form">
      <h2>基本信息</h2>
      
      <div className="form-group">
        <label>年龄范围：</label>
        <select 
          value={formData.age} 
          onChange={(e) => handleChange('age', e.target.value)}
          required
        >
          <option value="">请选择</option>
          <option value="18-25">18-25岁</option>
          <option value="26-35">26-35岁</option>
          <option value="36-45">36-45岁</option>
          <option value="46-55">46-55岁</option>
          <option value="56+">56岁以上</option>
        </select>
      </div>

      <div className="form-group">
        <label>性别：</label>
        <div className="radio-group">
          {['男', '女', '其他', '不愿透露'].map(option => (
            <label key={option} className="radio-label">
              <input
                type="radio"
                name="gender"
                value={option}
                checked={formData.gender === option}
                onChange={(e) => handleChange('gender', e.target.value)}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      {/* 其他表单字段... */}
      
      <button type="submit" className="submit-button">
        继续
      </button>
    </form>
  );
};

// 初始偏好调查步骤
const InitialPreferencesStep = ({ onSubmit, eventManager }) => {
  const [preferences, setPreferences] = useState({
    initialImpression: '',
    idealHouseSize: '',
    importantFactors: []
  });

  const handleFactorToggle = (factor) => {
    setPreferences(prev => ({
      ...prev,
      importantFactors: prev.importantFactors.includes(factor)
        ? prev.importantFactors.filter(f => f !== factor)
        : [...prev.importantFactors, factor]
    }));

    eventManager?.recordEvent({
      type: 'preference_selection',
      factor: factor,
      action: preferences.importantFactors.includes(factor) ? 'remove' : 'add',
      timestamp: Date.now()
    });
  };

  const handleSubmit = () => {
    if (preferences.initialImpression && preferences.idealHouseSize) {
      onSubmit(preferences);
    }
  };

  return (
    <div className="preferences-step">
      <h2>初始偏好调查</h2>
      
      <div className="question-group">
        <h3>您对机器人建筑的初始印象？</h3>
        <div className="radio-group">
          {[
            '非常期待和兴奋',
            '比较好奇和有兴趣',
            '中性，没有特别感觉',
            '略有疑虑',
            '比较担心和不信任'
          ].map(option => (
            <label key={option} className="radio-label">
              <input
                type="radio"
                name="initialImpression"
                value={option}
                checked={preferences.initialImpression === option}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  initialImpression: e.target.value
                }))}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <div className="question-group">
        <h3>您理想中的房屋规模？</h3>
        <div className="radio-group">
          {[
            '大型房屋（豪华别墅类型）',
            '中型房屋（标准家庭住宅）',
            '小型房屋（紧凑型住宅）',
            '视情况而定'
          ].map(option => (
            <label key={option} className="radio-label">
              <input
                type="radio"
                name="idealHouseSize"
                value={option}
                checked={preferences.idealHouseSize === option}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  idealHouseSize: e.target.value
                }))}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <div className="question-group">
        <h3>您最看重房屋的哪些方面？（可多选）</h3>
        <div className="checkbox-group">
          {[
            '外观美观性',
            '功能实用性',
            '建造效率',
            '成本经济性',
            '环保可持续性',
            '安全稳固性',
            '智能化程度'
          ].map(factor => (
            <label key={factor} className="checkbox-label">
              <input
                type="checkbox"
                checked={preferences.importantFactors.includes(factor)}
                onChange={() => handleFactorToggle(factor)}
              />
              {factor}
            </label>
          ))}
        </div>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={!preferences.initialImpression || !preferences.idealHouseSize}
        className="continue-button"
      >
        继续
      </button>
    </div>
  );
};

// 房屋展示步骤
const HouseExhibitionStep = ({ houses, onRatingChange, onComplete, eventManager }) => {
  const [currentHouseIndex, setCurrentHouseIndex] = useState(0);
  const [houseRatings, setHouseRatings] = useState({});
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const currentHouse = houses[currentHouseIndex];
  const dimensions = ['外观吸引力', '功能合理性', '过程观感', '质量信任度', '居住意愿'];

  const handleRating = (data) => {
    setHouseRatings(prev => ({
      ...prev,
      [currentHouse.type]: data.allRatings
    }));
    onRatingChange(currentHouse.type, data.allRatings);
    eventManager?.handleRatingChange(data);
  };

  const handleEmotion = (data) => {
    eventManager?.handleEmotionChange(data);
  };

  const nextHouse = () => {
    if (currentHouseIndex < houses.length - 1) {
      setCurrentHouseIndex(currentHouseIndex + 1);
      eventManager?.setCurrentHouse(houses[currentHouseIndex + 1].type);
    } else {
      onComplete();
    }
  };

  useEffect(() => {
    if (currentHouse) {
      eventManager?.setCurrentHouse(currentHouse.type);
    }
  }, [currentHouse, eventManager]);

  return (
    <div className="exhibition-step">
      <h2>房屋展示 ({currentHouseIndex + 1}/{houses.length})</h2>
      
      <div className="house-display">
        <div className="house-info">
          <h3>{currentHouse.type}</h3>
          <p>{currentHouse.description}</p>
          <div className="house-specs">
            <span>面积：{currentHouse.area}</span>
            <span>建造时间：{currentHouse.buildTime}</span>
          </div>
        </div>

        <div className="video-container">
          <video
            src={currentHouse.video}
            poster={currentHouse.image}
            controls
            onPlay={() => {
              setIsVideoPlaying(true);
              eventManager?.handleVideoInteraction({
                action: 'play',
                houseType: currentHouse.type,
                timestamp: Date.now()
              });
            }}
            onPause={() => {
              setIsVideoPlaying(false);
              eventManager?.handleVideoInteraction({
                action: 'pause',
                houseType: currentHouse.type,
                timestamp: Date.now()
              });
            }}
            onEnded={() => {
              eventManager?.handleVideoInteraction({
                action: 'end',
                houseType: currentHouse.type,
                timestamp: Date.now()
              });
            }}
          />
        </div>

        {isVideoPlaying && (
          <EmotionSlider
            onEmotionChange={handleEmotion}
            houseType={currentHouse.type}
          />
        )}
      </div>

      <div className="rating-section">
        <h3>请对本房屋进行评分</h3>
        <StarRating
          dimensions={dimensions}
          onRatingChange={handleRating}
          houseType={currentHouse.type}
        />
      </div>

      <div className="navigation">
        <button
          onClick={nextHouse}
          disabled={!houseRatings[currentHouse.type]}
          className="next-house-button"
        >
          {currentHouseIndex < houses.length - 1 ? '下一个房屋' : '完成展示'}
        </button>
      </div>
    </div>
  );
};

// 对比评估步骤
const ComparisonStep = ({ houses, surveyData, onRankingChange, onComplete, eventManager }) => {
  const [ranking, setRanking] = useState([]);
  const [completed, setCompleted] = useState(false);

  const handleRanking = (data) => {
    setRanking(data.newOrder);
    onRankingChange(data.newOrder);
    eventManager?.handleRankingChange(data);
  };

  const handleHouseSelect = (data) => {
    eventManager?.handleHouseSelection(data);
  };

  const handleComplete = () => {
    setCompleted(true);
    onComplete();
  };

  return (
    <div className="comparison-step">
      <h2>对比评估</h2>
      
      <ComparisonView
        houses={houses}
        onHouseSelect={handleHouseSelect}
        onDetailView={() => {}}
      />

      <div className="ranking-section">
        <DragRanking
          items={houses.map(h => h.type)}
          onRankingChange={handleRanking}
          title="请对三种房屋按喜好程度排序"
        />
      </div>

      <button
        onClick={handleComplete}
        disabled={ranking.length === 0}
        className="complete-comparison-button"
      >
        完成对比评估
      </button>
    </div>
  );
};

// 深度访谈步骤
const InterviewStep = ({ surveyData, onResponse, onComplete, eventManager }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});

  const questions = [
    "观看机器人搭建过程时，您最深刻的感受是什么？",
    "您对机器人建筑技术有什么建议或期望？",
    "如果要向朋友推荐机器人建筑，您会如何描述？",
    "您觉得机器人建筑最适合应用在哪些场景？"
  ];

  const handleVoiceResponse = (data) => {
    const questionId = `q${currentQuestionIndex}`;
    setResponses(prev => ({ ...prev, [questionId]: data }));
    onResponse(questionId, data);
    eventManager?.handleVoiceInput(data);
    nextQuestion();
  };

  const handleTextResponse = (data) => {
    const questionId = `q${currentQuestionIndex}`;
    setResponses(prev => ({ ...prev, [questionId]: data }));
    onResponse(questionId, data);
    eventManager?.handleTextInput(data);
    nextQuestion();
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="interview-step">
      <h2>深度访谈 ({currentQuestionIndex + 1}/{questions.length})</h2>
      
      <VoiceInput
        question={questions[currentQuestionIndex]}
        onVoiceComplete={handleVoiceResponse}
        onTextInput={handleTextResponse}
      />
    </div>
  );
};

// 完成步骤
const CompletionStep = ({ surveyData, eventManager }) => {
  const [dataExported, setDataExported] = useState(false);

  const exportData = () => {
    const exportedData = eventManager?.exportData();
    const dataStr = JSON.stringify({
      surveyData,
      eventData: exportedData
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `survey_data_${eventManager?.sessionId}.json`;
    link.click();
    
    setDataExported(true);
  };

  useEffect(() => {
    // 分析并显示统计信息
    if (eventManager) {
      const analyzer = new EventAnalyzer(eventManager.events);
      const analysis = analyzer.analyzeEngagement();
      console.log('用户参与度分析:', analysis);
    }
  }, [eventManager]);

  return (
    <div className="completion-step">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="completion-content"
      >
        <h2>🎉 研究完成！</h2>
        <p>感谢您的参与！您的宝贵意见将有助于机器人建筑技术的发展。</p>
        
        <div className="completion-summary">
          <h3>您的参与总结：</h3>
          <ul>
            <li>✅ 完成了所有展示观看</li>
            <li>✅ 提供了详细的评分反馈</li>
            <li>✅ 分享了深度访谈意见</li>
            <li>✅ 总计参与时间：{Math.round((Date.now() - eventManager?.startTime) / 60000)}分钟</li>
          </ul>
        </div>

        <div className="export-section">
          <button onClick={exportData} className="export-button">
            📥 导出我的数据
          </button>
          {dataExported && (
            <p className="export-success">✅ 数据已成功导出</p>
          )}
        </div>

        <p className="privacy-reminder">
          您的所有数据将被严格保密，仅用于学术研究目的。
        </p>
      </motion.div>
    </div>
  );
};

export default App;