]from flask import Flask, render_template, request, jsonify
import yfinance as yf
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import LSTM, Dense

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_data', methods=['POST'])
def get_data():
    symbol = request.json['symbol']
    try:
        df = yf.download(symbol, period="1y", interval="1d")
        df = df[['Close']].dropna()
        df['MA10'] = df['Close'].rolling(window=10).mean()
        df = df.dropna()

        # ARIMA Prediction
        arima_model = ARIMA(df['Close'], order=(5, 1, 0))
        arima_result = arima_model.fit()
        arima_pred = arima_result.forecast(steps=5).tolist()

        # LSTM Prediction
        data = df['Close'].values.reshape(-1, 1)
        scaler = MinMaxScaler()
        data_scaled = scaler.fit_transform(data)

        x_train, y_train = [], []
        for i in range(60, len(data_scaled)):
            x_train.append(data_scaled[i-60:i])
            y_train.append(data_scaled[i])
        x_train, y_train = np.array(x_train), np.array(y_train)

        model = Sequential()
        model.add(LSTM(units=50, return_sequences=True, input_shape=(x_train.shape[1], 1)))
        model.add(LSTM(units=50))
        model.add(Dense(1))
        model.compile(optimizer='adam', loss='mean_squared_error')
        model.fit(x_train, y_train, epochs=1, batch_size=32, verbose=0)

        last_60_days = data_scaled[-60:]
        X_test = np.array([last_60_days])
        lstm_pred_scaled = model.predict(X_test)
        lstm_pred = scaler.inverse_transform(lstm_pred_scaled).flatten().tolist()

        return jsonify({
            'dates': df.index[-30:].strftime('%Y-%m-%d').tolist(),
            'close': df['Close'][-30:].tolist(),
            'ma10': df['MA10'][-30:].tolist(),
            'arima_pred': arima_pred,
            'lstm_pred': lstm_pred
        })
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
