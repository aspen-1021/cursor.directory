// 事件管理器 - 处理所有用户交互事件
export class EventManager {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.events = [];
    this.currentPhase = '';
    this.currentHouse = '';
    this.startTime = Date.now();
    this.phaseStartTime = Date.now();
    
    // 初始化事件监听
    this.initializeEventListeners();
    
    // 定期保存数据
    this.autoSaveInterval = setInterval(() => {
      this.saveToLocalStorage();
    }, 10000); // 每10秒保存一次
  }

  // 初始化全局事件监听器
  initializeEventListeners() {
    // 页面可见性变化
    document.addEventListener('visibilitychange', () => {
      this.recordEvent({
        type: 'visibility_change',
        hidden: document.hidden,
        timestamp: Date.now()
      });
    });

    // 窗口焦点变化
    window.addEventListener('focus', () => {
      this.recordEvent({
        type: 'window_focus',
        action: 'gained',
        timestamp: Date.now()
      });
    });

    window.addEventListener('blur', () => {
      this.recordEvent({
        type: 'window_focus',
        action: 'lost',
        timestamp: Date.now()
      });
    });

    // 页面离开警告
    window.addEventListener('beforeunload', (e) => {
      this.recordEvent({
        type: 'page_unload',
        timestamp: Date.now()
      });
      this.saveToLocalStorage();
    });

    // 鼠标移动追踪（节流）
    let mouseMoveTimeout = null;
    document.addEventListener('mousemove', (e) => {
      if (mouseMoveTimeout) return;
      
      mouseMoveTimeout = setTimeout(() => {
        this.recordEvent({
          type: 'mouse_move',
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now(),
          phase: this.currentPhase
        });
        mouseMoveTimeout = null;
      }, 500); // 每500ms记录一次
    });

    // 滚动事件追踪
    let scrollTimeout = null;
    document.addEventListener('scroll', () => {
      if (scrollTimeout) return;
      
      scrollTimeout = setTimeout(() => {
        this.recordEvent({
          type: 'scroll',
          scrollY: window.scrollY,
          timestamp: Date.now(),
          phase: this.currentPhase
        });
        scrollTimeout = null;
      }, 300);
    });
  }

  // 记录事件
  recordEvent(eventData) {
    const event = {
      id: this.generateEventId(),
      sessionId: this.sessionId,
      phase: this.currentPhase,
      currentHouse: this.currentHouse,
      relativeTime: Date.now() - this.startTime,
      phaseTime: Date.now() - this.phaseStartTime,
      ...eventData
    };

    this.events.push(event);
    
    // 实时发送到服务器（可选）
    this.sendEventToServer(event);
    
    console.log('Event recorded:', event);
  }

  // 生成唯一事件ID
  generateEventId() {
    return `${this.sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 设置当前阶段
  setPhase(phaseName) {
    const previousPhase = this.currentPhase;
    this.currentPhase = phaseName;
    this.phaseStartTime = Date.now();
    
    this.recordEvent({
      type: 'phase_change',
      previousPhase: previousPhase,
      newPhase: phaseName,
      timestamp: Date.now()
    });
  }

  // 设置当前房屋
  setCurrentHouse(houseType) {
    this.currentHouse = houseType;
    this.recordEvent({
      type: 'house_context_change',
      houseType: houseType,
      timestamp: Date.now()
    });
  }

  // 特定交互事件处理器
  handleEmotionChange(data) {
    this.recordEvent({
      type: 'emotion_change',
      value: data.value,
      houseType: data.houseType,
      timestamp: data.timestamp,
      intensity: Math.abs(data.value),
      sentiment: data.value > 0 ? 'positive' : data.value < 0 ? 'negative' : 'neutral'
    });
  }

  handleRatingChange(data) {
    this.recordEvent({
      type: 'rating_change',
      dimension: data.dimension,
      rating: data.rating,
      houseType: data.houseType,
      allRatings: data.allRatings,
      timestamp: data.timestamp,
      completeness: Object.keys(data.allRatings).length
    });
  }

  handleRankingChange(data) {
    this.recordEvent({
      type: 'ranking_change',
      newOrder: data.newOrder,
      previousOrder: data.previousOrder,
      timestamp: data.timestamp,
      changes: this.calculateRankingChanges(data.previousOrder, data.newOrder)
    });
  }

  handleHouseSelection(data) {
    this.recordEvent({
      type: 'house_selection',
      houseType: data.houseType,
      selectionTime: data.selectionTime,
      viewMode: data.viewMode,
      timestamp: Date.now(),
      decisionTime: data.selectionTime - this.phaseStartTime
    });
  }

  handleVideoInteraction(data) {
    this.recordEvent({
      type: 'video_interaction',
      action: data.action, // 'play', 'pause', 'seek', 'end'
      progress: data.progress,
      houseType: data.houseType,
      timestamp: data.timestamp,
      watchDuration: data.watchDuration
    });
  }

  handleVoiceInput(data) {
    this.recordEvent({
      type: 'voice_input',
      question: data.question,
      duration: data.duration,
      timestamp: data.timestamp,
      audioSize: data.audioBlob ? data.audioBlob.size : 0
    });
  }

  handleTextInput(data) {
    this.recordEvent({
      type: 'text_input',
      question: data.question,
      textLength: data.text.length,
      wordCount: data.text.split(' ').length,
      timestamp: data.timestamp
    });
  }

  handleQuestionnaireResponse(data) {
    this.recordEvent({
      type: 'questionnaire_response',
      questionId: data.questionId,
      questionType: data.questionType,
      response: data.response,
      responseTime: data.responseTime,
      timestamp: data.timestamp
    });
  }

  // 计算排序变化
  calculateRankingChanges(oldOrder, newOrder) {
    const changes = [];
    oldOrder.forEach((item, oldIndex) => {
      const newIndex = newOrder.indexOf(item);
      if (newIndex !== oldIndex) {
        changes.push({
          item: item,
          oldPosition: oldIndex + 1,
          newPosition: newIndex + 1,
          change: newIndex - oldIndex
        });
      }
    });
    return changes;
  }

  // 保存到本地存储
  saveToLocalStorage() {
    try {
      const data = {
        sessionId: this.sessionId,
        events: this.events,
        currentPhase: this.currentPhase,
        startTime: this.startTime,
        lastSaved: Date.now()
      };
      localStorage.setItem(`survey_data_${this.sessionId}`, JSON.stringify(data));
    } catch (error) {
      console.error('保存到本地存储失败:', error);
    }
  }

  // 从本地存储恢复
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(`survey_data_${this.sessionId}`);
      if (saved) {
        const data = JSON.parse(saved);
        this.events = data.events || [];
        this.currentPhase = data.currentPhase || '';
        this.startTime = data.startTime || Date.now();
        return true;
      }
    } catch (error) {
      console.error('从本地存储加载失败:', error);
    }
    return false;
  }

  // 发送事件到服务器
  async sendEventToServer(event) {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.warn('发送事件到服务器失败:', error);
      // 失败时保存到本地队列
      this.addToOfflineQueue(event);
    }
  }

  // 离线队列管理
  addToOfflineQueue(event) {
    let queue = JSON.parse(localStorage.getItem('offline_events') || '[]');
    queue.push(event);
    localStorage.setItem('offline_events', JSON.stringify(queue));
  }

  // 同步离线事件
  async syncOfflineEvents() {
    const queue = JSON.parse(localStorage.getItem('offline_events') || '[]');
    if (queue.length === 0) return;

    try {
      await fetch('/api/events/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queue)
      });
      
      // 成功后清空队列
      localStorage.removeItem('offline_events');
      console.log(`同步了 ${queue.length} 个离线事件`);
    } catch (error) {
      console.error('同步离线事件失败:', error);
    }
  }

  // 获取统计数据
  getSessionStats() {
    const now = Date.now();
    const totalTime = now - this.startTime;
    
    const eventsByType = {};
    const eventsByPhase = {};
    
    this.events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsByPhase[event.phase] = (eventsByPhase[event.phase] || 0) + 1;
    });

    return {
      sessionId: this.sessionId,
      totalEvents: this.events.length,
      totalTime: totalTime,
      currentPhase: this.currentPhase,
      eventsByType: eventsByType,
      eventsByPhase: eventsByPhase,
      averageEventsPerMinute: (this.events.length / (totalTime / 60000)).toFixed(2)
    };
  }

  // 导出数据
  exportData() {
    return {
      sessionInfo: {
        sessionId: this.sessionId,
        startTime: this.startTime,
        endTime: Date.now(),
        totalDuration: Date.now() - this.startTime
      },
      events: this.events,
      stats: this.getSessionStats()
    };
  }

  // 清理资源
  cleanup() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    this.saveToLocalStorage();
  }
}

// 数据分析辅助类
export class EventAnalyzer {
  constructor(events) {
    this.events = events;
  }

  // 分析用户参与度
  analyzeEngagement() {
    const interactionEvents = this.events.filter(e => 
      ['emotion_change', 'rating_change', 'ranking_change', 'house_selection'].includes(e.type)
    );

    const timeSpentOnPhases = {};
    let currentPhase = '';
    let phaseStartTime = 0;

    this.events.forEach(event => {
      if (event.type === 'phase_change') {
        if (currentPhase) {
          timeSpentOnPhases[currentPhase] = event.timestamp - phaseStartTime;
        }
        currentPhase = event.newPhase;
        phaseStartTime = event.timestamp;
      }
    });

    return {
      totalInteractions: interactionEvents.length,
      timeSpentOnPhases: timeSpentOnPhases,
      engagementScore: this.calculateEngagementScore(interactionEvents)
    };
  }

  // 计算参与度分数
  calculateEngagementScore(interactionEvents) {
    const weights = {
      'emotion_change': 1,
      'rating_change': 2,
      'ranking_change': 3,
      'house_selection': 4,
      'voice_input': 5,
      'text_input': 4
    };

    let score = 0;
    interactionEvents.forEach(event => {
      score += weights[event.type] || 1;
    });

    return Math.min(score / 100, 1); // 标准化到0-1
  }

  // 分析偏好模式
  analyzePreferencePatterns() {
    const emotionEvents = this.events.filter(e => e.type === 'emotion_change');
    const ratingEvents = this.events.filter(e => e.type === 'rating_change');
    
    const houseEmotions = {};
    const houseRatings = {};

    emotionEvents.forEach(event => {
      if (!houseEmotions[event.houseType]) {
        houseEmotions[event.houseType] = [];
      }
      houseEmotions[event.houseType].push(event.value);
    });

    ratingEvents.forEach(event => {
      if (!houseRatings[event.houseType]) {
        houseRatings[event.houseType] = {};
      }
      houseRatings[event.houseType][event.dimension] = event.rating;
    });

    return {
      emotionalResponses: houseEmotions,
      dimensionRatings: houseRatings,
      preferenceStability: this.calculatePreferenceStability(emotionEvents)
    };
  }

  // 计算偏好稳定性
  calculatePreferenceStability(emotionEvents) {
    const houseVariances = {};
    
    Object.keys(this.groupEventsByHouse(emotionEvents)).forEach(houseType => {
      const emotions = emotionEvents
        .filter(e => e.houseType === houseType)
        .map(e => e.value);
      
      if (emotions.length > 1) {
        const mean = emotions.reduce((a, b) => a + b) / emotions.length;
        const variance = emotions.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / emotions.length;
        houseVariances[houseType] = variance;
      }
    });

    return houseVariances;
  }

  // 按房屋类型分组事件
  groupEventsByHouse(events) {
    return events.reduce((groups, event) => {
      const house = event.houseType || 'unknown';
      if (!groups[house]) groups[house] = [];
      groups[house].push(event);
      return groups;
    }, {});
  }

  // 生成可视化数据
  generateVisualizationData() {
    return {
      timelineData: this.generateTimelineData(),
      heatmapData: this.generateHeatmapData(),
      summaryStats: this.generateSummaryStats()
    };
  }

  generateTimelineData() {
    return this.events.map(event => ({
      time: event.relativeTime,
      type: event.type,
      phase: event.phase,
      value: event.value || event.rating || 1
    }));
  }

  generateHeatmapData() {
    const phases = ['welcome', 'preview', 'exhibition', 'comparison', 'interview'];
    const eventTypes = ['emotion_change', 'rating_change', 'house_selection', 'ranking_change'];
    
    const heatmap = {};
    phases.forEach(phase => {
      heatmap[phase] = {};
      eventTypes.forEach(type => {
        heatmap[phase][type] = this.events.filter(e => 
          e.phase === phase && e.type === type
        ).length;
      });
    });

    return heatmap;
  }

  generateSummaryStats() {
    const houses = ['大型房屋', '中型房屋', '小型房屋'];
    const stats = {};

    houses.forEach(house => {
      const houseEvents = this.events.filter(e => e.houseType === house);
      const emotions = houseEvents.filter(e => e.type === 'emotion_change');
      const ratings = houseEvents.filter(e => e.type === 'rating_change');

      stats[house] = {
        totalInteractions: houseEvents.length,
        averageEmotion: emotions.length > 0 ? 
          emotions.reduce((sum, e) => sum + e.value, 0) / emotions.length : 0,
        averageRating: ratings.length > 0 ?
          ratings.reduce((sum, e) => sum + e.rating, 0) / ratings.length : 0
      };
    });

    return stats;
  }
}